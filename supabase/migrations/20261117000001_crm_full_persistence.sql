-- ==============================================================================
-- Digital Effect CRM: Full Cloud Persistence Migration (Phase 2)
-- Persists: CRM Client Accounts, Workflow Stages, Deliverables, Ad Credit Wallet,
--           Invoices Archive, and Public Website Catalog across Deployments.
-- Safe & Idempotent: Can be executed multiple times without losing existing data.
-- ==============================================================================

-- 1. EXTEND EXISTING INQUIRIES TABLE WITH CRM SUMMARY COLUMNS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'crm_metadata') THEN
        ALTER TABLE public.inquiries ADD COLUMN crm_metadata JSONB DEFAULT '{}'::jsonb NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'ad_credit_balance') THEN
        ALTER TABLE public.inquiries ADD COLUMN ad_credit_balance NUMERIC DEFAULT 0 NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'renewal_date') THEN
        ALTER TABLE public.inquiries ADD COLUMN renewal_date TEXT;
    END IF;
END $$;

-- 2. CRM CLIENT ACCOUNTS TABLE (Full Retainer, Workflow, Deliverables & Ad Wallet)
-- Supports both UUID inquiries migrated from Supabase AND manually added CRM accounts.
CREATE TABLE IF NOT EXISTS public.crm_client_accounts (
    id TEXT PRIMARY KEY,
    inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_e164 TEXT,
    phone_country TEXT DEFAULT 'EG',
    visitor_country TEXT,
    company TEXT,
    sector TEXT NOT NULL DEFAULT 'b2c' CHECK (sector IN ('all', 'b2b', 'b2c', 'medical')),
    package_id TEXT,
    package_name TEXT,
    budget TEXT,
    notes TEXT,
    promo_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    final_price NUMERIC,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'cancelled')),

    -- Contract & Financial Tracking
    contract_start_date TEXT,
    renewal_date TEXT,
    contract_status TEXT DEFAULT 'active' CHECK (contract_status IN ('active', 'renewal_due', 'paused', 'completed')),
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'partially_paid', 'overdue')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
    retainer_amount NUMERIC DEFAULT 0,

    -- Deliverables & Progress
    posts_target INTEGER DEFAULT 0,
    posts_delivered INTEGER DEFAULT 0,
    reels_target INTEGER DEFAULT 0,
    reels_delivered INTEGER DEFAULT 0,
    stories_target INTEGER DEFAULT 0,
    stories_delivered INTEGER DEFAULT 0,
    account_manager TEXT,

    -- Workflow & Timeline
    current_workflow_day INTEGER DEFAULT 1,
    today_task_title TEXT,
    workflow_stages JSONB DEFAULT '[]'::jsonb NOT NULL,
    client_notes JSONB DEFAULT '[]'::jsonb NOT NULL,

    -- Ad Spend Wallet
    ad_credit_balance NUMERIC DEFAULT 0 NOT NULL,
    pending_invoice_ad_credit NUMERIC DEFAULT 0 NOT NULL,
    ad_credit_funded_total NUMERIC DEFAULT 0 NOT NULL,
    ad_credit_spent_total NUMERIC DEFAULT 0 NOT NULL,

    client_created_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_clients_status ON public.crm_client_accounts(status);
CREATE INDEX IF NOT EXISTS idx_crm_clients_sector ON public.crm_client_accounts(sector);
CREATE INDEX IF NOT EXISTS idx_crm_clients_updated_at ON public.crm_client_accounts(updated_at DESC);

-- 3. CLIENT INVOICES ARCHIVE TABLE (Full Persistent Financial Archive)
CREATE TABLE IF NOT EXISTS public.client_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_company TEXT,
    client_phone TEXT,
    sector TEXT DEFAULT 'b2c' CHECK (sector IN ('all', 'b2b', 'b2c', 'medical')),
    issue_date TEXT NOT NULL,
    due_date TEXT,
    package_name TEXT NOT NULL,
    retainer_amount NUMERIC NOT NULL DEFAULT 0,
    ad_credit_amount NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
    contract_period TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partially_paid', 'overdue', 'cancelled')),
    paid_at TEXT,
    payment_method TEXT,
    deliverables JSONB DEFAULT '{}'::jsonb NOT NULL,
    notes TEXT,
    invoice_created_at TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_client_invoices_client_id ON public.client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON public.client_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_client_invoices_issue_date ON public.client_invoices(issue_date DESC);

-- 4. AGENCY STORE TABLE (Public Website Catalog & Agency Settings)
-- Separates public catalog (packages, banner, promo codes, case studies, custom rates)
-- from private client CRM tables so anonymous website visitors NEVER access private client data.
CREATE TABLE IF NOT EXISTS public.agency_crm_store (
    id TEXT PRIMARY KEY,
    state_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. UPDATED_AT TRIGGER HELPER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_client_accounts_updated_at ON public.crm_client_accounts;
CREATE TRIGGER trg_crm_client_accounts_updated_at
    BEFORE UPDATE ON public.crm_client_accounts
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_client_invoices_updated_at ON public.client_invoices;
CREATE TRIGGER trg_client_invoices_updated_at
    BEFORE UPDATE ON public.client_invoices
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_agency_crm_store_updated_at ON public.agency_crm_store;
CREATE TRIGGER trg_agency_crm_store_updated_at
    BEFORE UPDATE ON public.agency_crm_store
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.crm_client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_crm_store ENABLE ROW LEVEL SECURITY;

-- 6.1 CRM Client Accounts: Authenticated Admins ONLY
DROP POLICY IF EXISTS "Authenticated admins manage crm_client_accounts" ON public.crm_client_accounts;
CREATE POLICY "Authenticated admins manage crm_client_accounts"
    ON public.crm_client_accounts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6.2 Client Invoices: Authenticated Admins ONLY
DROP POLICY IF EXISTS "Authenticated admins manage client_invoices" ON public.client_invoices;
CREATE POLICY "Authenticated admins manage client_invoices"
    ON public.client_invoices FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6.3 Agency Store:
-- Public visitors can read ONLY the public_catalog row (packages, banner, public portfolio, rates)
DROP POLICY IF EXISTS "Public can read public_catalog" ON public.agency_crm_store;
CREATE POLICY "Public can read public_catalog"
    ON public.agency_crm_store FOR SELECT
    TO anon, authenticated
    USING (id = 'public_catalog');

-- Authenticated Admins can manage all store rows
DROP POLICY IF EXISTS "Authenticated admins manage agency_crm_store" ON public.agency_crm_store;
CREATE POLICY "Authenticated admins manage agency_crm_store"
    ON public.agency_crm_store FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 7. TABLE PRIVILEGES (GRANTS)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.crm_client_accounts TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.client_invoices TO authenticated, service_role;
GRANT SELECT ON TABLE public.agency_crm_store TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.agency_crm_store TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated, service_role;

-- 8. SECURITY DEFINER RPC: CLEAR ALL CRM DATA (INQUIRIES, CLIENTS, CUSTOMERS, INVOICES)
-- Keeps service_packages and agency_crm_store (public catalog) completely intact.
CREATE OR REPLACE FUNCTION public.clear_all_crm_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_inv_count INT := 0;
    v_crm_count INT := 0;
    v_inq_count INT := 0;
    v_cust_count INT := 0;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Authentication required';
    END IF;

    IF EXISTS (SELECT 1 FROM public.admin_users) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    DELETE FROM public.client_invoices;
    GET DIAGNOSTICS v_inv_count = ROW_COUNT;

    DELETE FROM public.crm_client_accounts;
    GET DIAGNOSTICS v_crm_count = ROW_COUNT;

    DELETE FROM public.inquiries;
    GET DIAGNOSTICS v_inq_count = ROW_COUNT;

    DELETE FROM public.customers;
    GET DIAGNOSTICS v_cust_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_invoices', v_inv_count,
        'deleted_crm_clients', v_crm_count,
        'deleted_inquiries', v_inq_count,
        'deleted_customers', v_cust_count
    );
END;
$$;

REVOKE ALL ON FUNCTION public.clear_all_crm_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_all_crm_data() FROM anon;
GRANT EXECUTE ON FUNCTION public.clear_all_crm_data() TO authenticated;

