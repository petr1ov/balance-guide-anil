
-- Add telegram_id column to chat_messages for bot-based chat history
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS telegram_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_telegram_id ON public.chat_messages(telegram_id);

-- Create policy for service role access to chat_messages (for bot)
CREATE POLICY "Service role can manage all chat messages"
ON public.chat_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
