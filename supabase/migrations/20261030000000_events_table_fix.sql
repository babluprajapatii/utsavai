-- ============================================================================
-- UtsavAI - Complete Ordered Migration: Profiles & Events Fix
-- Migration: 20261030000000_events_table_fix.sql
-- Purpose: Resolves ERROR 42P01: relation "public.profiles" does not exist
--          by defining helper functions, profiles table, auth trigger,
--          events table, RLS policies, indexes, and cache refresh in exact order.
-- Idempotent: Safe to execute repeatedly in Supabase SQL Editor or CLI.
-- ============================================================================

-- Step 1: Ensure required PostgreSQL extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Step 2: HELPER FUNCTIONS (Must exist before triggers are attached)
-- ============================================================================

-- Function 2.1: Automated updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 2.2: Automated profile provisioning on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- Step 3: PROFILES TABLE (User identity model tied 1:1 with auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attach trigger on auth.users to auto-provision profile on registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Attach updated_at trigger on public.profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill any existing auth.users into public.profiles (safe idempotent insert)
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
    COALESCE(raw_user_meta_data->>'avatar_url', ''),
    COALESCE(created_at, NOW()),
    NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Step 4: PROFILES ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- Step 5: EVENTS TABLE (Created after profiles exists so FK resolves)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Wedding', 'Birthday', 'Community Event', 'Family Celebration', 'Custom Event')),
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(300),
    guest_count INTEGER DEFAULT 0 CHECK (guest_count >= 0),
    total_budget NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_budget >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_events_time_order CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

-- If events table already existed, ensure foreign key constraint to profiles exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'events_user_id_fkey'
    ) THEN
        ALTER TABLE public.events
        ADD CONSTRAINT events_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Attach updated_at trigger on public.events
DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Step 6: EVENTS ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events"
    ON public.events FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own events" ON public.events;
CREATE POLICY "Users can create their own events"
    ON public.events FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events"
    ON public.events FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own events"
    ON public.events FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- Step 7: PERFORMANCE INDEXES FOR API QUERY PATHS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);

-- ============================================================================
-- Step 8: POSTGREST SCHEMA CACHE RELOAD
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Step 9: VERIFICATION QUERIES
-- ============================================================================

-- 1. Check table existence
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns c WHERE c.table_schema = 'public' AND c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_name IN ('profiles', 'events')
ORDER BY table_name;

-- 2. Check row counts
SELECT 'profiles' AS table_name, count(*) AS total_rows FROM public.profiles
UNION ALL
SELECT 'events' AS table_name, count(*) AS total_rows FROM public.events;

-- 3. Check Row Level Security (RLS) status
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('profiles', 'events') AND relnamespace = 'public'::regnamespace
ORDER BY relname;

-- 4. Check active RLS policies
SELECT 
    polrelid::regclass::text AS table_name,
    polname AS policy_name,
    CASE polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command
FROM pg_policy
WHERE polrelid IN ('public.profiles'::regclass, 'public.events'::regclass)
ORDER BY table_name, command, policy_name;

-- 5. Check foreign key constraint
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'events' 
  AND kcu.column_name = 'user_id';
