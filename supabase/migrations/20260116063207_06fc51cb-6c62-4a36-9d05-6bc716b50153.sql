-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True when user has completed the Mini App onboarding (mode selection, scoring, birth data if Jyotish)';