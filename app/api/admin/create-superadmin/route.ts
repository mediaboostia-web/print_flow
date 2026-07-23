import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/lib/utils/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { superadmin } = body;

    if (!superadmin?.fullName || !superadmin?.email) {
      return NextResponse.json({ success: false, error: "Le nom et l'email du Super Admin sont obligatoires." }, { status: 400 });
    }

    if (!isValidEmail(superadmin.email)) {
      return NextResponse.json({ success: false, error: "L'adresse e-mail renseignée n'est pas valide (format invalide)." }, { status: 400 });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: "La clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée sur le serveur." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const normalizedEmail = superadmin.email.trim().toLowerCase();
    const saPassword = superadmin.password || 'RootAccess#2026';
    let authUserId: string | null = null;

    // 1. Create or retrieve auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: saPassword,
      email_confirm: true,
      user_metadata: { full_name: superadmin.fullName }
    });

    if (authData?.user) {
      authUserId = authData.user.id;
    } else if (authError) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
      }
    }

    // 2. Insert Superadmin row into Postgres
    const newSaId = `superadmin-${Date.now()}`;
    const newSa = {
      id: newSaId,
      full_name: superadmin.fullName.trim(),
      email: normalizedEmail,
      auth_user_id: authUserId,
      created_at: new Date().toISOString()
    };

    const { error: saDbError } = await supabaseAdmin.from('superadmins').insert([newSa]);
    if (saDbError) {
      console.error("Error inserting superadmin into Postgres:", saDbError);
      return NextResponse.json({ success: false, error: `Erreur base de données (superadmin): ${saDbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      superadmin: {
        id: newSa.id,
        fullName: newSa.full_name,
        email: newSa.email,
        authUserId: newSa.auth_user_id,
        createdAt: newSa.created_at
      }
    });

  } catch (err: any) {
    console.error("Server error in /api/admin/create-superadmin:", err);
    return NextResponse.json({ success: false, error: err.message || "Erreur serveur imprévue." }, { status: 500 });
  }
}
