-- Add unique constraint on telegram_id for upsert to work
ALTER TABLE public.reminders ADD CONSTRAINT reminders_telegram_id_key UNIQUE (telegram_id);

-- Also add unique constraint on user_id for when user is authenticated
-- Using a partial unique index to handle NULL values
CREATE UNIQUE INDEX IF NOT EXISTS reminders_user_id_unique 
ON public.reminders (user_id) 
WHERE user_id IS NOT NULL;