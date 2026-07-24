-- Print_Flow Supabase / PostgreSQL Database Schema
-- Single-tenant schema for one print shop, with multiple employee roles
-- (admin / commercial / chef_atelier) and a public online-ordering storefront.
-- Paste this entire script into the Supabase SQL Editor to set up your tables and RLS policies.
-- Note: this script does NOT seed an organization row — the app expects exactly
-- one row to already exist in public.organizations (created once, manually or
-- via the app's own onboarding, then never again).

-- 0. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (single row: the one company using this app)
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
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

-- 3. Clients
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

-- 4. Products
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

-- 5. Product Price Tiers
CREATE TABLE IF NOT EXISTS public.product_price_tiers (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    unit_price_fcfa NUMERIC NOT NULL
);

-- 6. Quotes (Devis)
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

-- 7. Quote Items
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

-- 8. BATs (Bon à Tirer)
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

-- 9. BAT Versions
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

-- 10. Purchase Orders (Bons de Commande / Production)
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

-- 11. Purchase Order Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    quote_item_id TEXT,
    description TEXT NOT NULL,
    finishing TEXT,
    quantity INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- 12. Invoices (Factures)
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

-- 13. Invoice Items
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

-- 14. Payments
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

-- 15. Delivery Notes (Bons de Livraison)
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

-- 16. Delivery Note Items
CREATE TABLE IF NOT EXISTS public.delivery_note_items (
    id TEXT PRIMARY KEY,
    delivery_note_id TEXT REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity_ready INTEGER NOT NULL
);

-- 17. Taxes Settings
CREATE TABLE IF NOT EXISTS public.taxes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL
);

-- 18. Machines Settings
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL
);

-- 19. Partners Settings
CREATE TABLE IF NOT EXISTS public.partners (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service TEXT NOT NULL
);

-- 20. Paper Formats Settings
CREATE TABLE IF NOT EXISTS public.paper_formats (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    format_name TEXT NOT NULL
);

-- 21. Audit Logs
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

-- 22. Online Orders (public catalogue / storefront orders)
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


--------------------------------------------------------------------------------
-- MIGRATION CLEANUP — removes objects from the previous multi-tenant SaaS
-- version of this schema (Super Admin, subscription plans, per-org billing).
-- Safe to re-run: every statement is IF EXISTS / idempotent.
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.superadmins CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.invoice_templates CASCADE;
DROP FUNCTION IF EXISTS public.toggle_catalogue_enabled();
ALTER TABLE public.organizations
  DROP COLUMN IF EXISTS subscription_plan_id CASCADE,
  DROP COLUMN IF EXISTS subscription_status CASCADE,
  DROP COLUMN IF EXISTS subscription_end_date CASCADE,
  DROP COLUMN IF EXISTS catalogue_enabled CASCADE;

--------------------------------------------------------------------------------
-- SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Helper function for RLS checks (SECURITY DEFINER to read profiles)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT organization_id FROM public.profiles
  WHERE auth_user_id = auth.uid()
     OR (email IS NOT NULL AND email = auth.jwt() ->> 'email')
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.is_superadmin() CASCADE;

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
    EXECUTE format('CREATE POLICY "org_select" ON public.%I FOR SELECT TO authenticated USING (organization_id = public.current_org_id())', t);
    EXECUTE format('CREATE POLICY "org_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id = public.current_org_id())', t);
    EXECUTE format('CREATE POLICY "org_update" ON public.%I FOR UPDATE TO authenticated USING (organization_id = public.current_org_id()) WITH CHECK (organization_id = public.current_org_id())', t);
    EXECUTE format('CREATE POLICY "org_delete" ON public.%I FOR DELETE TO authenticated USING (organization_id = public.current_org_id())', t);
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
      'CREATE POLICY "org_select" ON public.%1$I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND parent.organization_id = public.current_org_id()))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_insert" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND parent.organization_id = public.current_org_id()))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_update" ON public.%1$I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND parent.organization_id = public.current_org_id())) WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND parent.organization_id = public.current_org_id()))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_delete" ON public.%1$I FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND parent.organization_id = public.current_org_id()))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
  END LOOP;
END $$;

-- 3) Organizations RLS — single-row table, no INSERT/DELETE policy at all
-- (the one company row is created/removed only via manual SQL, never via the app).
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_select" ON public.organizations;
DROP POLICY IF EXISTS "org_insert" ON public.organizations;
DROP POLICY IF EXISTS "org_update" ON public.organizations;
DROP POLICY IF EXISTS "org_delete" ON public.organizations;
CREATE POLICY "org_select" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id());
CREATE POLICY "org_update" ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id())
  WITH CHECK (id = public.current_org_id());

-- 4) Profiles RLS — no direct INSERT policy: new employees are always
-- provisioned through the service-role /api/admin/create-profile route.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (organization_id = public.current_org_id())
  WITH CHECK (organization_id = public.current_org_id());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
  USING (organization_id = public.current_org_id());

-- 4b) Column-level lockdown on profiles: the row-level policy above lets any
-- employee UPDATE a colleague's row (needed for legitimate admin actions like
-- activating/deactivating a teammate), but must NOT let a caller change their
-- own or a colleague's role, organization, or auth linkage directly — that is
-- a privilege-escalation vector. Only self-service columns directly; role
-- changes go through the RPC below.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, email, phone, is_active, updated_at) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_profile_role(target_profile_id TEXT, new_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_org_id TEXT := public.current_org_id();
  caller_role TEXT;
  target_org_id TEXT;
BEGIN
  IF caller_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization context';
  END IF;
  SELECT role INTO caller_role FROM public.profiles
    WHERE (auth_user_id = auth.uid() OR email = auth.jwt() ->> 'email') AND organization_id = caller_org_id
    LIMIT 1;
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only an organization admin can change a colleague''s role';
  END IF;
  SELECT organization_id INTO target_org_id FROM public.profiles WHERE id = target_profile_id;
  IF target_org_id IS DISTINCT FROM caller_org_id THEN
    RAISE EXCEPTION 'Cannot modify a profile outside your organization';
  END IF;
  UPDATE public.profiles SET role = new_role, updated_at = now() WHERE id = target_profile_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_profile_role(TEXT, TEXT) TO authenticated;

-- 5) Public Storefront RLS for unauthenticated (anon) visitors — always
-- available (no subscription/plan gating), gated only by the company being active.
DROP POLICY IF EXISTS "anon_read_pro_orgs" ON public.organizations;
DROP POLICY IF EXISTS "anon_read_org" ON public.organizations;
CREATE POLICY "anon_read_org" ON public.organizations FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "anon_read_products" ON public.products;
CREATE POLICY "anon_read_products" ON public.products FOR SELECT TO anon
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = products.organization_id AND o.is_active = true
    )
  );

DROP POLICY IF EXISTS "anon_read_price_tiers" ON public.product_price_tiers;
CREATE POLICY "anon_read_price_tiers" ON public.product_price_tiers FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products pr
      JOIN public.organizations o ON o.id = pr.organization_id
      WHERE pr.id = product_price_tiers.product_id
        AND pr.is_active = true AND o.is_active = true
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
      WHERE o.id = online_orders.organization_id AND o.is_active = true
    )
  );
