-- Add consent fields to profiles table (for GDPR/personal data consent)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_personal_data boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_at timestamptz,
ADD COLUMN IF NOT EXISTS consent_version text;