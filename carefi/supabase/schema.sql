-- CareFi Supabase Database Schema
-- This schema handles user authentication, onboarding, image uploads, skin analysis, and orders

-- ============================================================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================================================
-- Note: Supabase Auth already provides auth.users with email/password
-- This table extends it with CareFi-specific user data

create table public.user_profiles (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  display_name text null,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamp with time zone null,
  email text null,
  password text null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION update_updated_at_column ();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ONBOARDING DATA TABLE
-- ============================================================================

CREATE TABLE public.onboarding_data (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Step 0: Skin Concerns (multi-select)
  skin_concerns TEXT[] NOT NULL DEFAULT '{}',
  -- Options: Acne, Dryness, Oiliness, Sensitivity, Hyperpigmentation, Fine lines, Redness, Large pores

  -- Step 1: Goals (multi-select)
  skin_goals TEXT[] NOT NULL DEFAULT '{}',
  -- Options: Clear skin, Even tone, Hydration, Anti-aging, Oil control, Calming

  -- Step 2: Current Routine (freeform text)
  current_routine TEXT,

  -- Step 3: Ingredients to Avoid (freeform text, could be parsed into array)
  ingredients_to_avoid TEXT,
  ingredients_to_avoid_array TEXT[] DEFAULT '{}', -- Parsed version for querying

  -- Step 4: Budget Range
  budget_min_usd DECIMAL(10,2) NOT NULL,
  budget_max_usd DECIMAL(10,2) NOT NULL,

  -- Constraints
  CONSTRAINT valid_budget CHECK (budget_min_usd >= 1 AND budget_min_usd <= budget_max_usd),
  CONSTRAINT valid_concerns CHECK (array_length(skin_concerns, 1) > 0),
  CONSTRAINT valid_goals CHECK (array_length(skin_goals, 1) > 0),

  -- One onboarding record per user
  CONSTRAINT one_per_user UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding"
  ON public.onboarding_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_onboarding_user_id ON public.onboarding_data(user_id);

-- ============================================================================
-- UPLOADED IMAGES TABLE
-- ============================================================================

CREATE TABLE public.uploaded_images (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- File metadata
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,

  -- Image angle/position (front, left_45, right_45)
  angle TEXT NOT NULL,

  -- Storage URLs (Supabase Storage bucket)
  storage_url TEXT NOT NULL, -- Full resolution image
  thumbnail_url TEXT,        -- Optional thumbnail

  -- Original upload info
  original_last_modified TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_angle CHECK (angle IN ('front', 'left_45', 'right_45')),
  CONSTRAINT valid_mime_type CHECK (mime_type LIKE 'image/%')
);

-- Enable Row Level Security
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own images"
  ON public.uploaded_images FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own images"
  ON public.uploaded_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own images"
  ON public.uploaded_images FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_images_user_id ON public.uploaded_images(user_id);
CREATE INDEX idx_images_angle ON public.uploaded_images(user_id, angle) WHERE deleted_at IS NULL;

-- ============================================================================
-- SKIN ANALYSIS RESULTS TABLE
-- ============================================================================

CREATE TABLE public.skin_analyses (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Analysis status
  status TEXT NOT NULL DEFAULT 'pending',
  -- Options: pending, uploading, screening, detecting, generating, complete, error

  -- Analysis results (JSONB for flexibility)
  detected_traits JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ id: string, name: string, severity: "low"|"moderate"|"high", description: string }]

  -- Confidence score (optional)
  confidence_score DECIMAL(5,2), -- 0.00 to 100.00

  -- Associated images
  image_ids UUID[] NOT NULL DEFAULT '{}',

  -- Error information (if status = error)
  error_message TEXT,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'uploading', 'screening', 'detecting', 'generating', 'complete', 'error')),
  CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100))
);

-- Enable Row Level Security
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analyses"
  ON public.skin_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.skin_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.skin_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_analyses_user_id ON public.skin_analyses(user_id);
CREATE INDEX idx_analyses_status ON public.skin_analyses(status);
CREATE INDEX idx_analyses_traits ON public.skin_analyses USING GIN(detected_traits);

-- ============================================================================
-- PRODUCTS TABLE (Reference data - not user-specific)
-- ============================================================================

CREATE TABLE public.products (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Product information
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  product_type TEXT NOT NULL, -- Cleanser, Toner, Moisturizer, Sunscreen, Treatment, etc.

  -- Pricing
  price_usd DECIMAL(10,2) NOT NULL,

  -- Merchants (array of retailers)
  merchants TEXT[] NOT NULL DEFAULT '{}',
  -- Options: Amazon, YesStyle, Sephora

  -- Ingredients
  active_ingredients TEXT[] NOT NULL DEFAULT '{}',
  all_ingredients TEXT, -- Full ingredient list

  -- Links and media
  product_link TEXT,
  image_url TEXT,

  -- Product metadata
  description TEXT,
  size TEXT, -- e.g., "50ml", "100g"

  -- For budget optimization
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  dupe_group_id UUID, -- Groups budget alternatives together

  -- Active status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  discontinued_at TIMESTAMPTZ
);

-- Enable Row Level Security (public read access)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

-- Indexes
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_price ON public.products(price_usd);
CREATE INDEX idx_products_dupe_group ON public.products(dupe_group_id) WHERE dupe_group_id IS NOT NULL;
CREATE INDEX idx_products_actives ON public.products USING GIN(active_ingredients);

-- ============================================================================
-- PERSONALIZED ROUTINES TABLE
-- ============================================================================

CREATE TABLE public.personalized_routines (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.skin_analyses(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Routine data (JSONB for flexibility with AM/PM steps)
  am_steps JSONB NOT NULL DEFAULT '[]',
  pm_steps JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ step: number, productType: string, actives: string[], rationale: string, recommendedProducts: Product[] }]

  -- Is this the current active routine?
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deactivated_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.personalized_routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own routines"
  ON public.personalized_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.personalized_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.personalized_routines FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_routines_user_id ON public.personalized_routines(user_id);
CREATE INDEX idx_routines_active ON public.personalized_routines(user_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- BUDGET OPTIMIZATIONS TABLE
-- ============================================================================

CREATE TABLE public.budget_optimizations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.personalized_routines(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optimization data (JSONB)
  comparisons JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ step: string, brandPick: Product, dupes: Product[], savings: number, savingsPercent: number }]

  -- Summary
  total_savings_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_savings_percent DECIMAL(5,2) NOT NULL DEFAULT 0,

  -- Is this the current active optimization?
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.budget_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own optimizations"
  ON public.budget_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimizations"
  ON public.budget_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own optimizations"
  ON public.budget_optimizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_optimizations_user_id ON public.budget_optimizations(user_id);
CREATE INDEX idx_optimizations_routine_id ON public.budget_optimizations(routine_id);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE public.orders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.personalized_routines(id) ON DELETE SET NULL,
  optimization_id UUID REFERENCES public.budget_optimizations(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Order details
  order_number TEXT NOT NULL UNIQUE, -- Human-readable order ID

  -- Order items (JSONB)
  items JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ productId: string, productName: string, brand: string, price: number, quantity: number }]

  -- Pricing
  subtotal_usd DECIMAL(10,2) NOT NULL,
  tax_usd DECIMAL(10,2) NOT NULL,
  total_usd DECIMAL(10,2) NOT NULL,

  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  -- Options: pending, payment_processing, payment_failed, completed, shipped, delivered, cancelled, refunded

  -- Payment information (DO NOT store card details - use Stripe)
  payment_intent_id TEXT, -- Stripe payment intent ID
  cardholder_name TEXT,   -- Only store name after successful payment

  -- Shipping (if applicable)
  shipping_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'payment_processing', 'payment_failed', 'completed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  CONSTRAINT valid_totals CHECK (subtotal_usd >= 0 AND tax_usd >= 0 AND total_usd >= 0)
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORDER-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ============================================================================
-- STORAGE BUCKETS (Configure in Supabase Dashboard or via API)
-- ============================================================================
-- Note: These need to be created via Supabase Dashboard or Storage API
--
-- Bucket: user-photos
--   - Purpose: Store uploaded user facial images
--   - Public: No (private, authenticated access only)
--   - File size limit: 10MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--   - Path structure: {user_id}/{angle}/{filename}
--
-- Bucket: user-photos-thumbnails
--   - Purpose: Store thumbnail versions
--   - Public: No (private)
--   - File size limit: 2MB
--
-- RLS policies for storage buckets should mirror database policies:
-- - Users can only upload to their own user_id folder
-- - Users can only read from their own user_id folder

-- ============================================================================
-- SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Example product data (you would populate this with real products)
-- INSERT INTO public.products (name, brand, product_type, price_usd, merchants, active_ingredients, is_premium)
-- VALUES
--   ('CeraVe Hydrating Cleanser', 'CeraVe', 'Cleanser', 14.99, ARRAY['Amazon', 'Sephora'], ARRAY['Ceramides', 'Hyaluronic Acid'], FALSE),
--   ('La Roche-Posay Toleriane Cleanser', 'La Roche-Posay', 'Cleanser', 24.99, ARRAY['Amazon', 'Sephora'], ARRAY['Ceramides', 'Niacinamide'], TRUE);

-- ============================================================================
-- NOTES AND SECURITY CONSIDERATIONS
-- ============================================================================
--
-- 1. AUTHENTICATION: Uses Supabase Auth (auth.users) for email/password
--    - User signup/login handled by Supabase Auth API
--    - Email verification recommended
--    - Password reset flows provided by Supabase
--
-- 2. ROW LEVEL SECURITY (RLS): All tables have RLS enabled
--    - Users can only access their own data
--    - Products table is publicly readable
--    - Service role can bypass RLS for admin operations
--
-- 3. PAYMENT SECURITY:
--    - NEVER store credit card numbers, CVV, or full card data
--    - Use Stripe or similar PCI-compliant payment processor
--    - Only store payment_intent_id and cardholder_name after success
--
-- 4. IMAGE STORAGE:
--    - Store images in Supabase Storage buckets (not in database)
--    - Database only stores metadata and URLs
--    - Implement image size limits and compression
--    - Use private buckets with authenticated access
--
-- 5. DATA RETENTION:
--    - Implement soft deletes for images (deleted_at)
--    - Consider GDPR compliance for user data deletion
--    - Archive old orders after N years
--
-- 6. INDEXES:
--    - Indexes created for common query patterns
--    - GIN indexes for JSONB and array columns
--    - Monitor and optimize based on actual usage
--
-- 7. FUTURE ENHANCEMENTS:
--    - Add user preferences table (notifications, theme, etc.)
--    - Add product reviews/ratings table
--    - Add user activity/events table for analytics
--    - Add email notification queue table
--    - Add admin users and roles
--
-- ============================================================================
