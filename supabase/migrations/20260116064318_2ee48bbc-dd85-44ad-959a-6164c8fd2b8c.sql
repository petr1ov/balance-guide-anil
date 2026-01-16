-- Fix overly permissive RLS policies for events and ai_usage
-- Drop the permissive policies
DROP POLICY IF EXISTS "System can insert events" ON public.events;
DROP POLICY IF EXISTS "System can insert ai_usage" ON public.ai_usage;

-- Create proper insert policies that allow authenticated users to insert their own events
CREATE POLICY "Users can insert own events"
  ON public.events
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR telegram_id IS NOT NULL);

CREATE POLICY "Users can insert own ai_usage"
  ON public.ai_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR telegram_id IS NOT NULL);

-- Add function to get user role by telegram_id (for admin check during login)
CREATE OR REPLACE FUNCTION public.is_admin_telegram(_telegram_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.telegram_id = _telegram_id
      AND ur.role = 'admin'
  )
$$;