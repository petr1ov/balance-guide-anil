-- Add astrology_frequency to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS astrology_frequency TEXT DEFAULT 'weekly' CHECK (astrology_frequency IN ('daily', 'weekly', 'monthly'));

-- Update mode check constraint to include 'astrology' (keep backward compatibility with 'jyotish')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mode_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_mode_check CHECK (mode IN ('fast', 'jyotish', 'astrology'));

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.astrology_frequency IS 'How often user wants astrology recommendations: daily, weekly, monthly';
COMMENT ON COLUMN public.profiles.mode IS 'User mode: fast (quick start), jyotish/astrology (with astrology)';

-- Update subscriptions table to have better structure for Free/Pro
-- Add subscription_type if not exists
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro'));

-- Add trial_ends_at for tracking 5-day trial
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '5 days');

COMMENT ON COLUMN public.subscriptions.subscription_type IS 'Subscription type: free (5 day trial), pro (30 days)';
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS 'When the free trial expires';