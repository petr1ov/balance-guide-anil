-- Create reminder_logs table to prevent duplicate sends
CREATE TABLE public.reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL,
  sent_date date NOT NULL DEFAULT CURRENT_DATE,
  sent_at timestamptz DEFAULT now(),
  UNIQUE (user_id, reminder_type, sent_date)
);

-- Enable RLS
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for reminder_logs (only service role inserts, users can view own)
CREATE POLICY "Users can view own logs"
ON public.reminder_logs FOR SELECT
USING (auth.uid() = user_id);