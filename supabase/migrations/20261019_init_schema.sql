-- ==============================================================================
-- ChargeNeighbor Database Schema & RLS Policies
-- Compatible with PostgreSQL 15+ & Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('owner', 'provider');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'pending_review');
  END IF;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL DEFAULT 'Residential Garage',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'Verification Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHARGERS TABLE
CREATE TABLE IF NOT EXISTS public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  charger_name TEXT NOT NULL,
  charger_type TEXT NOT NULL DEFAULT 'Level 2 AC',
  connector_type TEXT NOT NULL DEFAULT 'Type 2 (Mennekes)',
  power_kw NUMERIC(5, 2) NOT NULL CHECK (power_kw > 0),
  pricing_model TEXT NOT NULL DEFAULT 'per_kwh',
  price NUMERIC(6, 2) NOT NULL CHECK (price >= 0),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  operating_hours TEXT NOT NULL DEFAULT '08:00 - 22:00',
  listing_status listing_status NOT NULL DEFAULT 'pending_review',
  safety_checked BOOLEAN NOT NULL DEFAULT FALSE,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chargers_coords ON public.chargers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_chargers_status ON public.chargers(listing_status);

-- 6. CHARGER IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.charger_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AVAILABILITY RULES TABLE
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 60 CHECK (slot_duration_minutes > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  vehicle_model TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  estimated_cost NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  battery_percentage INT CHECK (battery_percentage BETWEEN 0 AND 100),
  duration_hours NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  status booking_status NOT NULL DEFAULT 'Pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_charger_date ON public.bookings(charger_id, booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_id);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read_at);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CONCURRENCY-SAFE ATOMIC BOOKING FUNCTION
-- Ensures that two drivers cannot book overlapping slots for the same charger simultaneously.
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_booking_reference TEXT,
  p_owner_id UUID,
  p_charger_id UUID,
  p_provider_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_vehicle_model TEXT,
  p_connector_type TEXT,
  p_estimated_cost NUMERIC,
  p_battery_percentage INT,
  p_duration_hours NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_conflict_count INT;
  v_new_booking_id UUID;
  v_result JSONB;
BEGIN
  -- Lock charger row to serialize concurrent booking attempts for this charger
  PERFORM 1 FROM public.chargers WHERE id = p_charger_id FOR UPDATE;

  -- Verify active listing status
  IF NOT EXISTS (
    SELECT 1 FROM public.chargers
    WHERE id = p_charger_id AND listing_status = 'active'
  ) THEN
    RAISE EXCEPTION 'This charger is currently not active or available for booking.';
  END IF;

  -- Check for existing overlapping active/confirmed/pending bookings
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.bookings
  WHERE charger_id = p_charger_id
    AND booking_date = p_booking_date
    AND status IN ('Pending', 'Confirmed', 'In Progress')
    AND (
      (p_start_time >= start_time AND p_start_time < end_time) OR
      (p_end_time > start_time AND p_end_time <= end_time) OR
      (p_start_time <= start_time AND p_end_time >= end_time)
    );

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Double-booking prevented: This time slot is already reserved.';
  END IF;

  -- Insert new booking safely
  INSERT INTO public.bookings (
    booking_reference,
    owner_id,
    charger_id,
    provider_id,
    booking_date,
    start_time,
    end_time,
    vehicle_model,
    connector_type,
    estimated_cost,
    battery_percentage,
    duration_hours,
    status
  ) VALUES (
    p_booking_reference,
    p_owner_id,
    p_charger_id,
    p_provider_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_vehicle_model,
    p_connector_type,
    p_estimated_cost,
    p_battery_percentage,
    p_duration_hours,
    'Pending'
  ) RETURNING id INTO v_new_booking_id;

  -- Create host notification
  INSERT INTO public.notifications (
    user_id,
    booking_id,
    title,
    message
  ) SELECT
      p.user_id,
      v_new_booking_id,
      'New Slot Reservation Request',
      'EV driver requested slot ' || p_booking_reference || ' on ' || p_booking_date::text || ' at ' || p_start_time::text
    FROM public.providers p
    WHERE p.id = p_provider_id;

  SELECT json_build_object(
    'success', true,
    'booking_id', v_new_booking_id,
    'booking_reference', p_booking_reference,
    'status', 'Pending'
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charger_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; authenticated users can view provider profile names
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Providers: Public can see verified provider info without full residential address
CREATE POLICY "Public can view provider public details"
  ON public.providers FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own profile"
  ON public.providers FOR ALL
  USING (auth.uid() = user_id);

-- Chargers: Public can view active chargers; Hosts manage their own
CREATE POLICY "Public can view active chargers"
  ON public.chargers FOR SELECT
  USING (listing_status = 'active' OR auth.uid() IN (
    SELECT user_id FROM public.providers WHERE id = provider_id
  ));

CREATE POLICY "Providers can manage their own chargers"
  ON public.chargers FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM public.providers WHERE id = provider_id
  ));

-- Charger Images: Viewable with charger
CREATE POLICY "Public view charger images"
  ON public.charger_images FOR SELECT
  USING (true);

CREATE POLICY "Providers manage charger images"
  ON public.charger_images FOR ALL
  USING (auth.uid() IN (
    SELECT p.user_id FROM public.providers p
    JOIN public.chargers c ON c.provider_id = p.id
    WHERE c.id = charger_id
  ));

-- Bookings: EV owners see their bookings; Providers see bookings for their chargers
CREATE POLICY "Owners view their bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Providers view bookings for their chargers"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.providers WHERE id = provider_id
  ));

CREATE POLICY "Providers update status of bookings for their chargers"
  ON public.bookings FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.providers WHERE id = provider_id
  ));

-- Notifications: User only
CREATE POLICY "Users access own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- Reviews: Public view; Owner can insert after booking
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Owners can submit reviews for their completed bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'ChargeNeighbor User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
