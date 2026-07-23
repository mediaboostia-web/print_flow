-- Print_Flow Supabase / PostgreSQL Database Schema
-- Standard production schema for multi-tenant print shop SaaS.
-- Paste this entire script into the Supabase SQL Editor to set up your tables, RLS policies, and seed data.

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_plan_id TEXT DEFAULT 'plan-free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    catalogue_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Profiles (Users/Collaborators)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'commercial', 'chef_atelier')),
    email TEXT UNIQUE,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Superadmins (SaaS Operator Platform Administrators)
CREATE TABLE IF NOT EXISTS public.superadmins (
    id TEXT PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_by TEXT,
    source TEXT DEFAULT 'interne', -- 'interne' | 'catalogue_public'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Products
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    material_type TEXT DEFAULT 'papier', -- 'papier' | 'textile' | 'support_rigide' | 'autre'
    paper_type TEXT,
    grammage_g INTEGER,
    format TEXT,
    format_options JSONB DEFAULT '[]'::jsonb,
    finishing TEXT,
    photo_url TEXT,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL DEFAULT 18.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Product Price Tiers
CREATE TABLE IF NOT EXISTS public.product_price_tiers (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    unit_price_fcfa NUMERIC NOT NULL
);

-- 7. Quotes (Devis)
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente', 'valide', 'refuse')),
    subtotal_fcfa NUMERIC NOT NULL,
    vat_amount_fcfa NUMERIC NOT NULL,
    margin_percent NUMERIC,
    total_fcfa NUMERIC NOT NULL,
    notes TEXT,
    created_by TEXT,
    validated_by TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Quote Items
CREATE TABLE IF NOT EXISTS public.quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id TEXT,
    description_snapshot TEXT NOT NULL,
    paper_snapshot TEXT,
    finishing_snapshot TEXT,
    quantity INTEGER NOT NULL,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL,
    line_total_fcfa NUMERIC NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 9. BATs (Bon à Tirer)
CREATE TABLE IF NOT EXISTS public.bats (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente', 'soumis', 'valide', 'refuse')),
    current_version_id TEXT,
    validated_by TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. BAT Versions
CREATE TABLE IF NOT EXISTS public.bat_versions (
    id TEXT PRIMARY KEY,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    comment TEXT,
    uploaded_by TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Purchase Orders (Bons de Commande / Production)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente_production', 'en_cours_impression', 'termine')),
    machine_setup TEXT,
    deposit_amount_fcfa NUMERIC,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Purchase Order Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    quote_item_id TEXT,
    description TEXT NOT NULL,
    finishing TEXT,
    quantity INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 13. Invoices (Factures)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente_acompte', 'partiellement_payee', 'soldee')),
    subtotal_fcfa NUMERIC NOT NULL,
    vat_amount_fcfa NUMERIC NOT NULL,
    total_fcfa NUMERIC NOT NULL,
    amount_paid_fcfa NUMERIC DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_reason TEXT,
    deleted_by TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Invoice Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    quote_item_id TEXT,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL,
    line_total_fcfa NUMERIC NOT NULL
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_fcfa NUMERIC NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('especes', 'cheque', 'mobile_money')),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    note TEXT,
    recorded_by TEXT,
    is_cancelled BOOLEAN DEFAULT false,
    cancelled_reason TEXT,
    cancelled_by TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Delivery Notes (Bons de Livraison)
CREATE TABLE IF NOT EXISTS public.delivery_notes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    delivery_number TEXT NOT NULL,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pret_expedition', 'livre')),
    delivered_to TEXT,
    signature_url TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. Delivery Note Items
CREATE TABLE IF NOT EXISTS public.delivery_note_items (
    id TEXT PRIMARY KEY,
    delivery_note_id TEXT REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity_ready INTEGER NOT NULL
);

-- 18. Taxes Settings
CREATE TABLE IF NOT EXISTS public.taxes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL
);

-- 19. Machines Settings
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL
);

-- 20. Partners Settings
CREATE TABLE IF NOT EXISTS public.partners (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service TEXT NOT NULL
);

-- 21. Paper Formats Settings
CREATE TABLE IF NOT EXISTS public.paper_formats (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    format_name TEXT NOT NULL
);

-- 22. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT,
    actor_role TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    before_data JSONB,
    after_data JSONB,
    metadata JSONB
);

-- 23. Online Orders (Public Catalogue - Formule Pro)
CREATE TABLE IF NOT EXISTS public.online_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'en_traitement', 'convertie', 'rejetee')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_fcfa NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 24. Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_fcfa NUMERIC NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 25. Invoice Templates
CREATE TABLE IF NOT EXISTS public.invoice_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


--------------------------------------------------------------------------------
-- SEED DATA (Default Imprimeries, Users, Plans & Products)
--------------------------------------------------------------------------------

INSERT INTO public.organizations (id, name, address, phone, email, is_active, subscription_plan_id, subscription_status, subscription_end_date, created_at) VALUES
('org-sud-print', 'Sud Print', 'Avenue Cheikh Anta Diop, Dakar, Sénégal', '+221 33 824 55 66', 'contact@sudprint.sn', true, 'plan-pro', 'active', '2027-01-01T00:00:00Z', '2026-01-10T08:00:00Z'),
('org-sahel-graphique', 'Sahel Graphique', 'Zone Industrielle, Bamako, Mali', '+223 20 22 44 88', 'info@sahelgraphique.ml', true, 'plan-std', 'active', '2026-12-31T23:59:59Z', '2026-02-15T09:30:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.superadmins (id, full_name, email, password, created_at) VALUES
('superadmin-1', 'Root Administrateur', 'superadmin@printflow.io', 'RootAccess#2026', '2026-01-01T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, organization_id, full_name, role, email, phone, is_active, password, created_at, updated_at) VALUES
('user-sud-admin', 'org-sud-print', 'Fatou Diop', 'admin', 'fatou.diop@sudprint.sn', '+221 77 654 32 10', true, 'sudprint2026', '2026-01-10T08:05:00Z', '2026-01-10T08:05:00Z'),
('user-sud-commercial', 'org-sud-print', 'Amadou Sow', 'commercial', 'amadou.sow@sudprint.sn', '+221 77 987 65 43', true, 'sudprint2026', '2026-01-12T10:00:00Z', '2026-01-12T10:00:00Z'),
('user-sud-atelier', 'org-sud-print', 'Moustapha Ndiaye', 'chef_atelier', 'moustapha.ndiaye@sudprint.sn', '+221 77 111 22 33', true, 'sudprint2026', '2026-01-12T10:15:00Z', '2026-01-12T10:15:00Z'),
('user-sahel-admin', 'org-sahel-graphique', 'Ousmane Keita', 'admin', 'ousmane.keita@sahelgraphique.ml', '+223 76 54 32 10', true, 'sahel2026', '2026-02-15T09:35:00Z', '2026-02-15T09:35:00Z'),
('user-sahel-commercial', 'org-sahel-graphique', 'Mariam Diallo', 'commercial', 'mariam.diallo@sahelgraphique.ml', '+223 66 88 99 00', true, 'sahel2026', '2026-02-16T11:00:00Z', '2026-02-16T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subscription_plans (id, name, price_fcfa, billing_cycle, description) VALUES
('plan-free', 'Essai Gratuit 7 jours', 0, '7_days', 'Accès complet pendant 7 jours pour tester Print_Flow'),
('plan-std', 'Formule Standard', 25000, 'monthly', 'Gestion complète devis, BAT, production & factures'),
('plan-pro', 'Formule Pro', 45000, 'monthly', 'Formule Standard + Catalogue public en ligne & Commandes directes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invoice_templates (id, name) VALUES
('modern', 'Moderne (Standard)'),
('tech', 'Tech-Luxe (Futuriste)'),
('classic', 'Classique (Imprimerie)')
ON CONFLICT (id) DO NOTHING;


--------------------------------------------------------------------------------
-- SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Helper functions for RLS checks (SECURITY DEFINER to read profiles & superadmins)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT organization_id FROM public.profiles 
  WHERE auth_user_id = auth.uid() 
     OR (email IS NOT NULL AND email = auth.jwt() ->> 'email')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.superadmins 
    WHERE auth_user_id = auth.uid() 
       OR (email IS NOT NULL AND email = auth.jwt() ->> 'email')
  );
$$;

-- 1) Tables scoped directly by organization_id
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','products','quotes','bats','purchase_orders','invoices',
    'delivery_notes','taxes','machines','partners','paper_formats',
    'audit_logs','online_orders'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "org_select" ON public.%I FOR SELECT TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_update" ON public.%I FOR UPDATE TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin()) WITH CHECK (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_delete" ON public.%I FOR DELETE TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin())', t);
  END LOOP;
END $$;

-- 2) Child tables scoped through parent table's organization_id
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES
    ('product_price_tiers', 'products', 'product_id'),
    ('quote_items', 'quotes', 'quote_id'),
    ('bat_versions', 'bats', 'bat_id'),
    ('purchase_order_items', 'purchase_orders', 'purchase_order_id'),
    ('invoice_items', 'invoices', 'invoice_id'),
    ('payments', 'invoices', 'invoice_id'),
    ('delivery_note_items', 'delivery_notes', 'delivery_note_id')
  ) AS x(child_table, parent_table, fk_column)
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_select" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_insert" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_update" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_delete" ON public.%I', rec.child_table);
    EXECUTE format(
      'CREATE POLICY "org_select" ON public.%1$I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_insert" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_update" ON public.%1$I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_delete" ON public.%1$I FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
  END LOOP;
END $$;

-- 3) Organizations RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_select" ON public.organizations;
DROP POLICY IF EXISTS "org_insert" ON public.organizations;
DROP POLICY IF EXISTS "org_update" ON public.organizations;
DROP POLICY IF EXISTS "org_delete" ON public.organizations;
CREATE POLICY "org_select" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id() OR public.is_superadmin());
CREATE POLICY "org_insert" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin() OR auth.uid() IS NOT NULL);
CREATE POLICY "org_update" ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id() OR public.is_superadmin())
  WITH CHECK (id = public.current_org_id() OR public.is_superadmin());
CREATE POLICY "org_delete" ON public.organizations FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- 4) Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR public.is_superadmin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid() OR organization_id = public.current_org_id() OR public.is_superadmin() OR auth.uid() IS NOT NULL);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR public.is_superadmin())
  WITH CHECK (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR public.is_superadmin());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
  USING (organization_id = public.current_org_id() OR public.is_superadmin());

-- 5) Superadmins RLS
ALTER TABLE public.superadmins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "superadmins_select" ON public.superadmins;
DROP POLICY IF EXISTS "superadmins_insert" ON public.superadmins;
DROP POLICY IF EXISTS "superadmins_update" ON public.superadmins;
DROP POLICY IF EXISTS "superadmins_delete" ON public.superadmins;
CREATE POLICY "superadmins_select" ON public.superadmins FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR public.is_superadmin());
CREATE POLICY "superadmins_insert" ON public.superadmins FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin() OR auth.uid() IS NOT NULL);
CREATE POLICY "superadmins_update" ON public.superadmins FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email' OR public.is_superadmin());
CREATE POLICY "superadmins_delete" ON public.superadmins FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- 6) Public Storefront (Formule Pro) RLS for unauthenticated (anon) visitors
DROP POLICY IF EXISTS "anon_read_pro_orgs" ON public.organizations;
CREATE POLICY "anon_read_pro_orgs" ON public.organizations FOR SELECT TO anon
  USING (subscription_plan_id = 'plan-pro' AND is_active = true AND catalogue_enabled = true);

DROP POLICY IF EXISTS "anon_read_products" ON public.products;
CREATE POLICY "anon_read_products" ON public.products FOR SELECT TO anon
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = products.organization_id
        AND o.subscription_plan_id = 'plan-pro' AND o.is_active = true AND o.catalogue_enabled = true
    )
  );

DROP POLICY IF EXISTS "anon_read_price_tiers" ON public.product_price_tiers;
CREATE POLICY "anon_read_price_tiers" ON public.product_price_tiers FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products pr
      JOIN public.organizations o ON o.id = pr.organization_id
      WHERE pr.id = product_price_tiers.product_id
        AND pr.is_active = true AND o.subscription_plan_id = 'plan-pro' AND o.is_active = true AND o.catalogue_enabled = true
    )
  );

DROP POLICY IF EXISTS "anon_insert_clients" ON public.clients;
CREATE POLICY "anon_insert_clients" ON public.clients FOR INSERT TO anon
  WITH CHECK (source = 'catalogue_public');

DROP POLICY IF EXISTS "anon_insert_online_orders" ON public.online_orders;
CREATE POLICY "anon_insert_online_orders" ON public.online_orders FOR INSERT TO anon
  WITH CHECK (
    status = 'nouvelle' AND
    subtotal_fcfa >= 0 AND
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = online_orders.organization_id
        AND o.subscription_plan_id = 'plan-pro' AND o.is_active = true AND o.catalogue_enabled = true
    )
  );

-- 7) Subscription Plans & Invoice Templates RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sub_plans_select" ON public.subscription_plans;
CREATE POLICY "sub_plans_select" ON public.subscription_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "sub_plans_manage" ON public.subscription_plans;
CREATE POLICY "sub_plans_manage" ON public.subscription_plans FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_temp_select" ON public.invoice_templates;
CREATE POLICY "inv_temp_select" ON public.invoice_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "inv_temp_manage" ON public.invoice_templates;
CREATE POLICY "inv_temp_manage" ON public.invoice_templates FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
