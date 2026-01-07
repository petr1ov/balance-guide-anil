-- Create users/profiles table for Telegram users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  name TEXT,
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'hi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create balance_scores table
CREATE TABLE public.balance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  spirituality INTEGER CHECK (spirituality >= 0 AND spirituality <= 10) DEFAULT 0,
  relationships INTEGER CHECK (relationships >= 0 AND relationships <= 10) DEFAULT 0,
  health INTEGER CHECK (health >= 0 AND health <= 10) DEFAULT 0,
  finance INTEGER CHECK (finance >= 0 AND finance <= 10) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  focus_area TEXT NOT NULL CHECK (focus_area IN ('spirituality', 'relationships', 'health', 'finance')),
  point_a TEXT,
  ideal TEXT,
  year_goal TEXT,
  short_goal TEXT,
  month_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create chat_messages table for conversation history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (public read for now, will restrict with Telegram auth)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (true);

-- RLS Policies for balance_scores
CREATE POLICY "Users can view own scores" ON public.balance_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON public.balance_scores
  FOR INSERT WITH CHECK (true);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (true);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();