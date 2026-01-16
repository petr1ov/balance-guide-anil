-- Add admin roles for the existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE telegram_id IN ('828936535', '189415023')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add RLS policy for admins to read all profiles (needed for admin dashboard)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to read all balance_scores
CREATE POLICY "Admins can view all balance_scores"
ON public.balance_scores
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to read all chat_messages
CREATE POLICY "Admins can view all chat_messages"
ON public.chat_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to read all sphere_details
CREATE POLICY "Admins can view all sphere_details"
ON public.sphere_details
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));