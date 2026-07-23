import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/lib/utils/email';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await request.json();
    const { org, admin } = body;

    if (!org?.name || !admin?.fullName || !admin?.email) {
      return NextResponse.json({ success: false, error: "Le nom de l'organisation, le nom de l'admin et l'email sont obligatoires." }, { status: 400 });
    }

    if (!isValidEmail(admin.email)) {
      return NextResponse.json({ success: false, error: "L'adresse e-mail renseignée n'est pas valide (format invalide)." }, { status: 400 });
    }

    const keyToUse = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !keyToUse) {
      return NextResponse.json({ success: false, error: "Supabase n'est pas configuré sur le serveur." }, { status: 500 });
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const normalizedEmail = admin.email.trim().toLowerCase();
    const adminPassword = admin.password || 'admin123';
    let authUserId: string | null = null;

    // 1. Attempt creating or retrieving auth user
    try {
      if (serviceRoleKey) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { full_name: admin.fullName }
        });

        if (authData?.user) {
          authUserId = authData.user.id;
        } else if (authError) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
          if (existingUser) {
            authUserId = existingUser.id;
          }
        }
      }
    } catch (authErr) {
      console.warn("Auth user creation warning (service role key may be absent):", authErr);
    }

    // 2. Insert Organization into Postgres
    const newOrgId = `org-${Date.now()}`;
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const newOrg = {
      id: newOrgId,
      name: org.name.trim(),
      address: org.address?.trim() || '',
      phone: org.phone?.trim() || '',
      email: org.email?.trim() || normalizedEmail,
      is_active: true,
      subscription_plan_id: org.subscriptionPlanId || 'plan-pro',
      subscription_status: 'active',
      subscription_end_date: endDate,
      catalogue_enabled: true,
      created_at: new Date().toISOString()
    };

    const { error: orgDbError } = await supabaseAdmin.from('organizations').insert([newOrg]);
    if (orgDbError) {
      console.error("Error inserting organization into Postgres:", orgDbError);
      return NextResponse.json({ success: false, error: `Erreur base de données (organisation): ${orgDbError.message}` }, { status: 500 });
    }

    // 3. Insert Admin Profile into Postgres
    const newProfileId = `user-${Date.now()}`;
    const newProfile = {
      id: newProfileId,
      organization_id: newOrgId,
      full_name: admin.fullName.trim(),
      role: 'admin',
      email: normalizedEmail,
      phone: admin.phone?.trim() || '',
      is_active: true,
      auth_user_id: authUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileDbError } = await supabaseAdmin.from('profiles').insert([newProfile]);
    if (profileDbError) {
      console.error("Error inserting profile into Postgres:", profileDbError);
      return NextResponse.json({ success: false, error: `Erreur base de données (profil admin): ${profileDbError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      org: {
        id: newOrg.id,
        name: newOrg.name,
        address: newOrg.address,
        phone: newOrg.phone,
        email: newOrg.email,
        isActive: newOrg.is_active,
        subscriptionPlanId: newOrg.subscription_plan_id,
        subscriptionStatus: newOrg.subscription_status,
        subscriptionEndDate: newOrg.subscription_end_date,
        catalogueEnabled: newOrg.catalogue_enabled,
        createdAt: newOrg.created_at
      },
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
    console.error("Server error in /api/admin/create-org:", err);
    return NextResponse.json({ success: false, error: err.message || "Erreur serveur imprévue." }, { status: 500 });
  }
}
