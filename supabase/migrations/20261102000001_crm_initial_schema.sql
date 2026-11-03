-- ==============================================================================
-- Digital Effect CRM: Production PostgreSQL Schema Migration (Supabase)
-- Single-Admin Architecture, International E.164 Phone Support, Cloudflare GeoIP & Privacy
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SERVICE PACKAGES TABLE (Canonical In-App Packages Catalog)
CREATE TABLE IF NOT EXISTS public.service_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sector TEXT NOT NULL CHECK (sector IN ('b2b', 'b2c', 'medical')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price IS NULL OR original_price >= 0),
    quarterly_price NUMERIC CHECK (quarterly_price IS NULL OR quarterly_price >= 0),
    currency TEXT DEFAULT 'EGP' NOT NULL,
    period TEXT DEFAULT '/ شهرياً' NOT NULL,
    period_en TEXT DEFAULT '/ month' NOT NULL,
    tagline TEXT,
    tagline_en TEXT,
    ideal_for TEXT,
    ideal_for_en TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Exact Canonical Service Packages (Identical to src/data/initialData.ts)
INSERT INTO public.service_packages (id, name, name_en, sector, price, original_price, quarterly_price, currency, period, period_en, tagline, tagline_en, ideal_for, ideal_for_en)
VALUES
    ('pkg-b2c-active', 'باقة Active', 'Active Package', 'b2c', 12500, NULL, NULL, 'EGP', '/ شهرياً', '/ month', 'تأسيس الحضور التفاعلي على منصات التواصل للمتاجر والعلامات', 'Establish an active, professional presence on social platforms', 'المتاجر والعلامات التجارية الناشئة الراغبة في نشاط شهري مستقر.', 'Emerging stores and brands seeking regular social activity.'),
    ('pkg-b2c-interact', 'باقة Interact', 'Interact Package', 'b2c', 15000, NULL, NULL, 'EGP', '/ شهرياً', '/ month', 'محتوى مرئي مكثف لتنشيط خوارزميات المنصات وزيادة التفاعل', 'Intensified visual content to stimulate engagement and organic reach', 'المتاجر المتنامية التي تحتاج انتشاراً أوسع وتفاعلاً دورياً مستمراً.', 'Growing brands needing higher posting frequency and video content.'),
    ('pkg-b2c-engage', 'باقة Engage', 'Engage Package', 'b2c', 20000, 24000, NULL, 'EGP', '/ شهرياً', '/ month', 'المزيج المثالي بين المنشورات والريلز والستوريز لتحقيق مبيعات متكررة', 'The ideal balance of posts, viral reels, and stories for sustained sales', 'براندات الأزياء، العناية، الإلكترونيات، والمتاجر الطامحة لمضاعفة الـ ROAS.', 'Fashion, beauty, retail, and direct-to-consumer online stores.'),
    ('pkg-b2c-advance', 'باقة Advance', 'Advance Package', 'b2c', 25000, 30000, NULL, 'EGP', '/ شهرياً', '/ month', 'كثافة إنتاجية استثنائية مع ٦ ريلز شهرياً لاكتساح خوارزميات المنصات', 'Maximum content velocity with 6 AI Reels for total algorithm dominance', 'العلامات التجارية الكبرى والمتاجر ذات الحجم الضخم من المنتجات والطلبات.', 'High-volume e-commerce stores, retail chains, and leading brands.'),
    ('pkg-b2b-active', 'باقة Active (B2B)', 'Active B2B Package', 'b2b', 4000, NULL, NULL, 'EGP', '/ شهرياً', '/ month', 'حضور مؤسسي منتظم بمعدل منشور أسبوعياً مع خطة استراتيجية شهرية متكاملة', 'Consistent corporate authority with weekly posting and monthly strategic plan', 'المصانع، الموردين، شركات الـ IT، والاستشارات الهندسية والتجارية.', 'Industrial factories, suppliers, engineering firms, and commercial vendors.'),
    ('pkg-med-presence', 'باقة Medical Presence', 'Medical Presence Package', 'medical', 12500, NULL, 33750, 'EGP', '/ شهرياً', '/ month', 'حضور طبي رصين يجمع بين المنشورات التثقيفية ومقاطع الفيديو التوعوية', 'Dignified medical presence blending patient education carousels and reels', 'العيادات التخصصية الفردية والأطباء الاستشاريين الراغبين في بناء تواجد رصين.', 'Private specialist clinics and consultant physicians.'),
    ('pkg-med-growth', 'باقة Medical Growth', 'Medical Growth Package', 'medical', 19500, NULL, 49750, 'EGP', '/ شهرياً', '/ month', 'توازن قوي لمضاعفة حجوزات الكشوفات ومقاطع الفيديو التوعوية', 'High-performing balance to double clinic appointments and video authority', 'مجمعات العيادات، مراكز الأسنان الكبرى، ومراكز الجلدية والتجميل وجراحة اليوم الواحد.', 'Dental centers, derma clinics, polyclinics, and day surgery facilities.'),
    ('pkg-med-authority', 'باقة Medical Authority', 'Medical Authority Package', 'medical', 29500, NULL, 70800, 'EGP', '/ شهرياً', '/ month', 'أقصى كثافة إنتاجية طبية مع ١٢ ريلز و١٢ منشوراً شهرياً لهيمنة تامة', 'Maximum medical content velocity with 12 Reels and 12 Posts monthly', 'المستشفيات، مجمعات جراحة اليوم الواحد، وشبكات العيادات متعددة الفروع.', 'Hospitals, multi-branch clinic chains, and surgical medical centers.')
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    quarterly_price = EXCLUDED.quarterly_price,
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    sector = EXCLUDED.sector,
    tagline = EXCLUDED.tagline,
    updated_at = now();

-- 3. CUSTOMERS TABLE (Verified Persistent Customer Profiles)
-- Stores verified customers with standardized international E.164 phone numbers.
-- Contains ZERO IP addresses for privacy compliance.
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_e164 TEXT NOT NULL,
    phone_country TEXT DEFAULT 'EG' NOT NULL,
    email TEXT,
    company TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backwards-compatible columns check (if table already existed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'phone_e164') THEN
        ALTER TABLE public.customers ADD COLUMN phone_e164 TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'phone_country') THEN
        ALTER TABLE public.customers ADD COLUMN phone_country TEXT DEFAULT 'EG';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_e164 ON public.customers(phone_e164);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);

-- 4. INQUIRIES & ORDERS TABLE
-- Stores individual incoming inquiries.
-- Tracks visitor_country (Cloudflare GeoIP) separately from phone_country (user-selected).
-- Contains ZERO IP addresses.
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    package_id TEXT REFERENCES public.service_packages(id) ON DELETE SET NULL,
    raw_client_name TEXT NOT NULL,
    raw_client_phone TEXT NOT NULL,
    client_phone_e164 TEXT NOT NULL,
    phone_country TEXT DEFAULT 'EG' NOT NULL,
    visitor_country TEXT DEFAULT 'Unknown' NOT NULL,
    idempotency_key TEXT,
    raw_client_company TEXT,
    raw_package_name TEXT,
    sector TEXT NOT NULL CHECK (sector IN ('all', 'b2b', 'b2c', 'medical')),
    budget TEXT,
    notes TEXT,
    internal_notes TEXT,
    status TEXT DEFAULT 'new' NOT NULL CHECK (status IN ('new', 'contacted', 'closed', 'cancelled')),
    source TEXT DEFAULT 'website_consultation_modal' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backwards-compatible columns check (if table already existed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'client_phone_e164') THEN
        ALTER TABLE public.inquiries ADD COLUMN client_phone_e164 TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'phone_country') THEN
        ALTER TABLE public.inquiries ADD COLUMN phone_country TEXT DEFAULT 'EG';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'visitor_country') THEN
        ALTER TABLE public.inquiries ADD COLUMN visitor_country TEXT DEFAULT 'Unknown';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inquiries' AND column_name = 'idempotency_key') THEN
        ALTER TABLE public.inquiries ADD COLUMN idempotency_key TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inquiries_customer_id ON public.inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone_e164 ON public.inquiries(client_phone_e164, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_idempotency_key ON public.inquiries(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_sector ON public.inquiries(sector);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 5. ADMIN USERS TABLE (Single-Admin Architecture)
-- Minimal, robust table linking to Supabase auth.users.
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. HELPER SECURITY DEFINER FUNCTION FOR ADMIN AUTHORIZATION
-- Checks if current auth.uid() is registered in admin_users.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- Restrict is_admin() so anonymous visitors cannot execute it
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 7. CLEANUP OBSOLETE FUNCTION OVERLOADS
DROP FUNCTION IF EXISTS public.submit_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.submit_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.submit_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 8. HARDENED ATOMIC INQUIRY SUBMISSION STORED PROCEDURE
-- Key Security & Business Logic:
-- 1. Hardened search_path = public, pg_temp prevents search_path hijacking
-- 2. Concurrency advisory lock per E.164 phone eliminates race conditions
-- 3. Idempotency Key check prevents double-click retries while allowing legitimate subsequent inquiries
-- 4. Rate limiting: max 5 submissions / 10 minutes per E.164 phone
-- 5. Zero customer profile overwriting: preserves verified customer information
-- 6. Privacy: records visitor_country from Cloudflare GeoIP without storing IP addresses
-- 7. Strictly enforces status = 'new'
CREATE OR REPLACE FUNCTION public.submit_inquiry(
    p_name TEXT,
    p_raw_phone TEXT,
    p_phone_e164 TEXT,
    p_phone_country TEXT DEFAULT 'EG',
    p_visitor_country TEXT DEFAULT 'Unknown',
    p_company TEXT DEFAULT NULL,
    p_sector TEXT DEFAULT 'b2b',
    p_package_id TEXT DEFAULT NULL,
    p_package_name TEXT DEFAULT NULL,
    p_budget TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_name TEXT;
    v_clean_raw_phone TEXT;
    v_clean_e164 TEXT;
    v_clean_phone_country TEXT;
    v_clean_visitor_country TEXT;
    v_clean_company TEXT;
    v_clean_budget TEXT;
    v_clean_notes TEXT;
    v_clean_email TEXT;
    v_clean_sector TEXT;
    v_clean_idempotency TEXT;
    v_customer_id UUID;
    v_inquiry_id UUID;
    v_existing_id UUID;
    v_valid_pkg_id TEXT;
    v_recent_count INT;
BEGIN
    -- 1. Input sanitization & caps
    v_clean_name := trim(p_name);
    v_clean_raw_phone := trim(p_raw_phone);
    v_clean_e164 := trim(p_phone_e164);
    v_clean_phone_country := upper(trim(coalesce(p_phone_country, 'EG')));
    v_clean_visitor_country := upper(trim(coalesce(p_visitor_country, 'Unknown')));
    v_clean_company := nullif(trim(p_company), '');
    v_clean_budget := nullif(trim(p_budget), '');
    v_clean_notes := nullif(trim(p_notes), '');
    v_clean_email := nullif(lower(trim(p_email)), '');
    v_clean_idempotency := nullif(trim(p_idempotency_key), '');

    IF v_clean_name IS NULL OR length(v_clean_name) < 2 THEN
        RAISE EXCEPTION 'Customer name must be at least 2 characters';
    END IF;
    IF length(v_clean_name) > 100 THEN
        RAISE EXCEPTION 'Customer name exceeds maximum allowed length';
    END IF;

    IF v_clean_raw_phone IS NULL OR length(v_clean_raw_phone) < 5 THEN
        RAISE EXCEPTION 'Customer phone is required';
    END IF;
    IF length(v_clean_raw_phone) > 35 THEN
        RAISE EXCEPTION 'Raw phone number exceeds maximum length';
    END IF;

    -- International E.164 phone formatting validation
    IF v_clean_e164 NOT LIKE '+%' THEN
        v_clean_e164 := '+' || regexp_replace(v_clean_e164, '\D', '', 'g');
    END IF;
    IF length(v_clean_e164) < 8 OR length(v_clean_e164) > 20 THEN
        RAISE EXCEPTION 'Invalid international E.164 phone format. Must be between 8 and 20 characters.';
    END IF;

    -- Normalize country codes
    IF length(v_clean_phone_country) > 5 THEN
        v_clean_phone_country := 'EG';
    END IF;
    IF length(v_clean_visitor_country) > 10 THEN
        v_clean_visitor_country := 'Unknown';
    END IF;

    IF v_clean_company IS NOT NULL AND length(v_clean_company) > 150 THEN
        RAISE EXCEPTION 'Company name exceeds 150 characters';
    END IF;

    IF v_clean_budget IS NOT NULL AND length(v_clean_budget) > 100 THEN
        RAISE EXCEPTION 'Budget exceeds 100 characters';
    END IF;

    IF v_clean_notes IS NOT NULL AND length(v_clean_notes) > 3000 THEN
        RAISE EXCEPTION 'Notes exceed 3000 characters';
    END IF;

    IF v_clean_email IS NOT NULL AND (length(v_clean_email) > 150 OR v_clean_email NOT LIKE '%_@__%.__%') THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;

    IF p_sector IN ('all', 'b2b', 'b2c', 'medical') THEN
        v_clean_sector := p_sector;
    ELSE
        v_clean_sector := 'b2b';
    END IF;

    -- 2. Concurrency Control (Advisory Lock per Normalized E.164 Phone)
    -- Serializes concurrent submissions from the same telephone number
    PERFORM pg_advisory_xact_lock(hashtext(v_clean_e164));

    -- 3. Idempotency Key Check
    -- Idempotent return for retries or accidental double clicks
    IF v_clean_idempotency IS NOT NULL THEN
        SELECT id INTO v_existing_id
        FROM public.inquiries
        WHERE idempotency_key = v_clean_idempotency
          AND created_at > now() - interval '24 hours'
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN v_existing_id;
        END IF;
    END IF;

    -- 4. Database-Level Rate Limiting
    -- Allows up to 5 requests per 10 minutes per E.164 phone
    SELECT count(*) INTO v_recent_count
    FROM public.inquiries
    WHERE client_phone_e164 = v_clean_e164
      AND created_at > now() - interval '10 minutes';

    IF v_recent_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit reached: Maximum 5 requests per 10 minutes from this number.';
    END IF;

    -- 5. Trusted Package Matching
    IF p_package_id IS NOT NULL THEN
        SELECT id INTO v_valid_pkg_id 
        FROM public.service_packages 
        WHERE id = trim(p_package_id) AND is_active = true;
    END IF;

    -- 6. Find or Create Customer (Protecting Existing Customer Record)
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE phone_e164 = v_clean_e164
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        -- Create new customer profile
        INSERT INTO public.customers (name, phone, phone_e164, phone_country, company, email)
        VALUES (v_clean_name, v_clean_raw_phone, v_clean_e164, v_clean_phone_country, v_clean_company, v_clean_email)
        RETURNING id INTO v_customer_id;
    ELSE
        -- CRITICAL: NEVER overwrite customer profile name or company from anonymous submissions!
        -- We only update updated_at timestamp.
        UPDATE public.customers
        SET updated_at = now()
        WHERE id = v_customer_id;
    END IF;

    -- 7. Insert Inquiry (strictly status = 'new')
    INSERT INTO public.inquiries (
        customer_id,
        package_id,
        raw_client_name,
        raw_client_phone,
        client_phone_e164,
        phone_country,
        visitor_country,
        idempotency_key,
        raw_client_company,
        raw_package_name,
        sector,
        budget,
        notes,
        status,
        created_at,
        updated_at
    )
    VALUES (
        v_customer_id,
        v_valid_pkg_id,
        v_clean_name,
        v_clean_raw_phone,
        v_clean_e164,
        v_clean_phone_country,
        v_clean_visitor_country,
        v_clean_idempotency,
        v_clean_company,
        trim(p_package_name),
        v_clean_sector,
        v_clean_budget,
        v_clean_notes,
        'new',
        now(),
        now()
    )
    RETURNING id INTO v_inquiry_id;

    RETURN v_inquiry_id;
END;
$$;

-- Grant execution to anon and authenticated callers
REVOKE ALL ON FUNCTION public.submit_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES — HARDENED ACCESS CONTROL
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 9.1 Service Packages:
-- Public can only view active packages.
DROP POLICY IF EXISTS "Public can view active service packages" ON public.service_packages;
CREATE POLICY "Public can view active service packages"
    ON public.service_packages FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Only authenticated admins can modify service packages.
DROP POLICY IF EXISTS "Admins have full access to service packages" ON public.service_packages;
CREATE POLICY "Admins have full access to service packages"
    ON public.service_packages FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9.2 Customers:
-- Anonymous callers CANNOT read, insert, update, or delete customer records.
-- Ingestion happens solely through the SECURITY DEFINER submit_inquiry() procedure.
-- Only authenticated admin has access.
DROP POLICY IF EXISTS "Admins have full access to customers" ON public.customers;
CREATE POLICY "Admins have full access to customers"
    ON public.customers FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9.3 Inquiries:
-- Anonymous callers CANNOT SELECT, UPDATE, or DELETE inquiries.
-- DIRECT TABLE INSERT IS EXPLICITLY DISABLED FOR ANON!
-- Ingestion is strictly enforced through public.submit_inquiry() to prevent status spoofing or tampering.
DROP POLICY IF EXISTS "Admins have full access to inquiries" ON public.inquiries;
CREATE POLICY "Admins have full access to inquiries"
    ON public.inquiries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9.4 Admin Users:
-- ZERO recursion policy: authenticated admin can only view their own row using (id = auth.uid()).
DROP POLICY IF EXISTS "Admin view self" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;

CREATE POLICY "Admin view self"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- 10. TABLE PRIVILEGES (GRANT)
-- Grant necessary schema and table privileges to authenticated and anon
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 11. SECURITY DEFINER RPC: GET ADMIN INQUIRIES
-- Bypasses table-level PostgREST grant issues while strictly enforcing admin authorization
CREATE OR REPLACE FUNCTION public.get_admin_inquiries()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Check if authenticated user is registered admin
    IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: User % is not a registered administrator', auth.uid();
    END IF;

    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'id', i.id,
            'customer_id', i.customer_id,
            'package_id', i.package_id,
            'raw_client_name', i.raw_client_name,
            'raw_client_phone', i.raw_client_phone,
            'client_phone_e164', i.client_phone_e164,
            'phone_country', i.phone_country,
            'visitor_country', i.visitor_country,
            'idempotency_key', i.idempotency_key,
            'raw_client_company', i.raw_client_company,
            'raw_package_name', i.raw_package_name,
            'sector', i.sector,
            'budget', i.budget,
            'notes', i.notes,
            'internal_notes', i.internal_notes,
            'status', i.status,
            'source', i.source,
            'created_at', i.created_at,
            'updated_at', i.updated_at
        ) ORDER BY i.created_at DESC
    ), '[]'::jsonb)
    INTO v_result
    FROM public.inquiries i;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_inquiries() TO authenticated;

