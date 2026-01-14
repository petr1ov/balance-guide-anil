-- Extend balance_scores to support 7 spheres
ALTER TABLE public.balance_scores ADD COLUMN IF NOT EXISTS career integer;
ALTER TABLE public.balance_scores ADD COLUMN IF NOT EXISTS rest integer;
ALTER TABLE public.balance_scores ADD COLUMN IF NOT EXISTS environment integer;

-- Create table for sphere details with Point A and Point B
CREATE TABLE IF NOT EXISTS public.sphere_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sphere TEXT NOT NULL,
  score INTEGER,
  point_a TEXT,
  point_b TEXT,
  daily_plan TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sphere)
);

-- Enable RLS on sphere_details
ALTER TABLE public.sphere_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for sphere_details
CREATE POLICY "Users can view their own sphere details"
ON public.sphere_details
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sphere details"
ON public.sphere_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sphere details"
ON public.sphere_details
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sphere details"
ON public.sphere_details
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at on sphere_details
CREATE TRIGGER update_sphere_details_updated_at
BEFORE UPDATE ON public.sphere_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add conversation_state to profiles for tracking bot conversation flow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS conversation_state JSONB DEFAULT '{"stage": "idle", "current_sphere_index": 0}'::jsonb;