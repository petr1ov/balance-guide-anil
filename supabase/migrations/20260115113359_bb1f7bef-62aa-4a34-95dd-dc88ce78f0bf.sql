-- Add Jyotish mode fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'fast' CHECK (mode IN ('fast', 'jyotish'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_time TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_country TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_city TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jyotish_summary JSONB;

-- Add jyotish accent to sphere_details
ALTER TABLE public.sphere_details 
ADD COLUMN IF NOT EXISTS jyotish_accent TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.mode IS 'User mode: fast (quick start) or jyotish (with astrology)';
COMMENT ON COLUMN public.profiles.jyotish_summary IS 'Cached Jyotish analysis from MCP';