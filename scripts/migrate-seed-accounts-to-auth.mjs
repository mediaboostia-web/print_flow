// One-off migration script: creates real Supabase Auth accounts for any
// `profiles` / `superadmins` rows that still have auth_user_id = NULL
// (the legacy seeded/demo accounts that used to authenticate via a
// plaintext password column, before RLS lockdown removed that path).
//
// Run manually, NOT as part of the app runtime:
//   node scripts/migrate-seed-accounts-to-auth.mjs
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, either
// already exported in the environment or present in a .env.local file at
// the project root.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnvLocal() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment or in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function generateTempPassword() {
  return randomBytes(12).toString('base64url');
}

async function migrateTable(table, { fullNameColumn }) {
  const { data: rows, error } = await supabase
    .from(table)
    .select('*')
    .is('auth_user_id', null);

  if (error) {
    console.error(`Failed to read ${table}:`, error.message);
    return [];
  }

  const results = [];

  for (const row of rows || []) {
    if (!row.email) {
      console.warn(`Skipping ${table} row ${row.id}: no email.`);
      continue;
    }

    const password = row.password || generateTempPassword();
    const wasGenerated = !row.password;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: row.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: row[fullNameColumn] }
    });

    let authUserId = authData?.user?.id ?? null;

    if (!authUserId && authError) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email?.toLowerCase() === row.email.toLowerCase());
      if (existing) {
        authUserId = existing.id;
      } else {
        console.error(`Failed to create auth user for ${table} ${row.email}:`, authError.message);
        continue;
      }
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ auth_user_id: authUserId })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Created auth user for ${row.email} but failed to link ${table}.${row.id}:`, updateError.message);
      continue;
    }

    results.push({ table, id: row.id, email: row.email, password: wasGenerated ? password : '(existing seed password)', generated: wasGenerated });
  }

  return results;
}

const profileResults = await migrateTable('profiles', { fullNameColumn: 'full_name' });
const superadminResults = await migrateTable('superadmins', { fullNameColumn: 'full_name' });

const all = [...profileResults, ...superadminResults];

console.log('\n=== Migration report ===');
if (all.length === 0) {
  console.log('No rows needed migration (all already have auth_user_id set).');
} else {
  for (const r of all) {
    console.log(`[${r.table}] ${r.email} -> auth account created. Password: ${r.password}`);
  }
  console.log(`\n${all.length} account(s) migrated. Share generated passwords with their owners securely, then have them change it on first login.`);
}
