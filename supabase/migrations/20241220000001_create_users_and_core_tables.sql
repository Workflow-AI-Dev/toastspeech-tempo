CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  age_group TEXT,
  profession TEXT,
  purposes TEXT[],
  custom_purpose TEXT,
  phone TEXT,
  location TEXT,
  avatar TEXT DEFAULT 'felix',
  avatar_style TEXT DEFAULT 'avataaars',
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  total_speeches INTEGER DEFAULT 0,
  avg_score DECIMAL DEFAULT 0,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  notifications_enabled BOOLEAN DEFAULT true,
  daily_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT false,
  theme_preference TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.speeches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  speech_type TEXT NOT NULL CHECK (speech_type IN ('toastmasters', 'custom')),
  category TEXT,
  purpose TEXT,
  target_duration TEXT,
  evaluator_name TEXT,
  evaluation_criteria TEXT[],
  recording_method TEXT CHECK (recording_method IN ('audio', 'video', 'upload')),
  recording_uri TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  duration_seconds INTEGER,
  transcription TEXT,
  overall_score INTEGER,
  pace_score INTEGER,
  filler_words_count INTEGER,
  emotional_delivery_score INTEGER,
  clarity_score INTEGER,
  confidence_score INTEGER,
  engagement_score INTEGER,
  word_count INTEGER,
  avg_pause_duration TEXT,
  improvement_percentage TEXT,
  ai_feedback JSONB,
  strengths TEXT[],
  improvements TEXT[],
  key_insights TEXT[],
  suggestions TEXT[],
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  speech_id UUID REFERENCES public.speeches(id) ON DELETE CASCADE,
  original_speech_uri TEXT,
  evaluation_recording_uri TEXT,
  evaluation_method TEXT CHECK (evaluation_method IN ('audio', 'video', 'upload')),
  transcribed_evaluation TEXT,
  overall_score INTEGER,
  evaluation_accuracy_score INTEGER,
  speaking_quality_score INTEGER,
  content_insight_score INTEGER,
  clarity_score INTEGER,
  confidence_score INTEGER,
  duration_seconds INTEGER,
  word_count INTEGER,
  avg_pause_duration TEXT,
  improvement_percentage TEXT,
  ai_feedback JSONB,
  strengths TEXT[],
  improvements TEXT[],
  key_insights TEXT[],
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  speeches_count INTEGER DEFAULT 0,
  evaluations_count INTEGER DEFAULT 0,
  avg_score DECIMAL DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  speeches_used INTEGER DEFAULT 0,
  evaluations_used INTEGER DEFAULT 0,
  speeches_limit INTEGER NOT NULL,
  evaluations_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speeches_updated_at BEFORE UPDATE ON public.speeches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_speeches_user_id ON public.speeches(user_id);
CREATE INDEX idx_speeches_created_at ON public.speeches(created_at DESC);
CREATE INDEX idx_evaluations_user_id ON public.evaluations(user_id);
CREATE INDEX idx_evaluations_speech_id ON public.evaluations(speech_id);
CREATE INDEX idx_user_progress_user_date ON public.user_progress(user_id, date DESC);
CREATE INDEX idx_subscription_usage_user_period ON public.subscription_usage(user_id, year, month);


