import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/lib/utils/email';
import { getCallerAuth } from '@/lib/supabase/serverAuth';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await request.json();
    const { profile } = body;

    if (!profile?.fullName || !profile?.email || !profile?.role) {
      return NextResponse.json({ success: false, error: "Le nom, l'email et le rôle du collaborateur sont obligatoires." }, { status: 400 });
    }

    if (!isValidEmail(profile.email)) {
      return NextResponse.json({ success: false, error: "L'adresse e-mail renseignée n'est pas valide (format invalide)." }, { status: 400 });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY absent). Contactez l'administrateur système." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Only an admin of the company may provision a new collaborator, and
    // always into their own organization — never a client-supplied one.
    const caller = await getCallerAuth(supabaseAdmin);
    if (!caller || !caller.organizationId) {
      return NextResponse.json({ success: false, error: "Authentification requise." }, { status: 401 });
    }
    if (caller.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Vous n'êtes pas autorisé à ajouter un collaborateur." }, { status: 403 });
    }
    const organizationId = caller.organizationId;

    const normalizedEmail = profile.email.trim().toLowerCase();
    const profilePassword = profile.password || 'user123';
    let authUserId: string | null = null;

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: profilePassword,
        email_confirm: true,
        user_metadata: { full_name: profile.fullName }
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
    } catch (authErr) {
      console.warn("Auth user creation warning in create-profile:", authErr);
    }

    // 2. Insert Profile into Postgres
    const newProfileId = `user-${Date.now()}`;
    const newProfile = {
      id: newProfileId,
      organization_id: organizationId,
      full_name: profile.fullName.trim(),
      role: profile.role,
      email: normalizedEmail,
      phone: profile.phone?.trim() || '',
      is_active: true,
      auth_user_id: authUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileDbError } = await supabaseAdmin.from('profiles').insert([newProfile]);
    if (profileDbError) {
      console.error("Error inserting profile into Postgres:", profileDbError);
      return NextResponse.json({ success: false, error: `Erreur base de données (profil): ${profileDbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: newProfile.id,
        organizationId: newProfile.organization_id,
        fullName: newProfile.full_name,
        role: newProfile.role,
        email: newProfile.email,
        phone: newProfile.phone,
        isActive: newProfile.is_active,
        authUserId: newProfile.auth_user_id,
        createdAt: newProfile.created_at,
        updatedAt: newProfile.updated_at
      }
    });

  } catch (err: any) {
    console.error("Server error in /api/admin/create-profile:", err);
    return NextResponse.json({ success: false, error: err.message || "Erreur serveur imprévue." }, { status: 500 });
  }
}
