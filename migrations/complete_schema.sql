-- ===========================================
-- COMPREHENSIVE SUPABASE SCHEMA
-- UGC Avatar Application - All Tables
-- ===========================================

-- This file contains the complete schema for the UGC Avatar application
-- Generated from current Supabase database state
-- Last updated: $(date)

-- ===========================================
-- PROFILES TABLE
-- ===========================================

-- Safely drop existing policies, triggers, and functions if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
  END IF;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.update_profiles_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table for storing user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,   -- enforce unique emails
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  credits INTEGER DEFAULT 60    -- user credits for job processing
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Trigger to auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.update_profiles_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name_text TEXT;
  last_name_text TEXT;
  full_name_text TEXT;
  email_text TEXT;
BEGIN
  -- Try to extract first_name and last_name from metadata
  first_name_text := NEW.raw_user_meta_data ->> 'first_name';
  last_name_text  := NEW.raw_user_meta_data ->> 'last_name';

  -- If missing, try full_name and split into first + last
  IF first_name_text IS NULL AND last_name_text IS NULL THEN
    full_name_text := NEW.raw_user_meta_data ->> 'full_name';
    IF full_name_text IS NOT NULL THEN
      first_name_text := SPLIT_PART(full_name_text, ' ', 1);
      last_name_text  := NULLIF(SUBSTRING(full_name_text FROM LENGTH(first_name_text) + 2), '');
    END IF;
  END IF;

  -- Defaults
  first_name_text := COALESCE(first_name_text, '');
  last_name_text  := COALESCE(last_name_text, '');
  email_text      := NEW.email;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, first_name_text, last_name_text, email_text);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- IMAGE JOBS TABLE
-- ===========================================

-- Safely drop existing policies and triggers if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'image_jobs') THEN
    DROP POLICY IF EXISTS "Users can view their own image_jobs" ON public.image_jobs;
    DROP POLICY IF EXISTS "Users can insert their own image_jobs" ON public.image_jobs;
    DROP POLICY IF EXISTS "Users can update their own image_jobs" ON public.image_jobs;
    DROP POLICY IF EXISTS "Users can delete their own image_jobs" ON public.image_jobs;

    DROP TRIGGER IF EXISTS update_image_jobs_updated_at ON public.image_jobs;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_image_jobs_updated_at_column();

CREATE TABLE IF NOT EXISTS public.image_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Input data
  prompt TEXT NOT NULL,
  aspect_ratio TEXT CHECK (aspect_ratio IN ('portrait', 'landscape')),
  input_image_url TEXT, -- input image URL
  image_gen_url TEXT, -- generated image URL
  image_analysis JSONB, -- analysis of the input image

  -- Status flow
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'done', 'failed')),

  -- Action type
  action TEXT DEFAULT 'generate'
    CHECK (action IN ('generate', 'regenerate')),

  -- Error handling
  error_message TEXT, -- useful for debugging failed jobs

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_image_jobs_user_id ON public.image_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_image_jobs_status ON public.image_jobs(status);
CREATE INDEX IF NOT EXISTS idx_image_jobs_created_at ON public.image_jobs(created_at);

-- RLS
ALTER TABLE public.image_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own image_jobs" ON public.image_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image_jobs" ON public.image_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image_jobs" ON public.image_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image_jobs" ON public.image_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_image_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_image_jobs_updated_at
  BEFORE UPDATE ON public.image_jobs
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_image_jobs_updated_at_column();

-- ===========================================
-- VIDEO JOBS TABLE
-- ===========================================

-- Safely drop existing policies and triggers if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'video_jobs') THEN
    DROP POLICY IF EXISTS "Users can view their own video_jobs" ON public.video_jobs;
    DROP POLICY IF EXISTS "Users can insert their own video_jobs" ON public.video_jobs;
    DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;
    DROP POLICY IF EXISTS "Users can delete their own video_jobs" ON public.video_jobs;

    DROP TRIGGER IF EXISTS update_video_jobs_updated_at ON public.video_jobs;
    DROP TRIGGER IF EXISTS "Video Jobs (UGC nanobanana)" ON public.video_jobs;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_video_jobs_updated_at_column();

CREATE TABLE IF NOT EXISTS public.video_jobs (
  video_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_job_id UUID NOT NULL REFERENCES public.image_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  generated_video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON public.video_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_created_at ON public.video_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_video_jobs_image_job_id ON public.video_jobs(image_job_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_user_id ON public.video_jobs(user_id);

-- RLS
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video_jobs" ON public.video_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video_jobs" ON public.video_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video_jobs" ON public.video_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Webhook trigger for n8n workflow
CREATE TRIGGER "Video Jobs (UGC nanobanana)"
  AFTER INSERT ON public.video_jobs
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://n8n.reclad.site/webhook/603a258b-f177-432e-b5af-a9200096f029',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    '10000'
  );

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_video_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_jobs_updated_at
  BEFORE UPDATE ON public.video_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_jobs_updated_at_column();

-- ===========================================
-- CREDIT TRANSACTIONS TABLE
-- ===========================================

-- Safely drop existing policies and triggers if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'credit_transactions') THEN
    DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can insert their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can update their own credit transactions" ON public.credit_transactions;
    DROP POLICY IF EXISTS "Users can delete their own credit transactions" ON public.credit_transactions;

    DROP TRIGGER IF EXISTS update_user_credits_trigger ON public.credit_transactions;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.update_user_credits();
DROP FUNCTION IF EXISTS public.deduct_credits(UUID, TEXT, UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.add_credits(UUID, TEXT, UUID, INTEGER, TEXT);

-- Create credit_transactions table for tracking credit usage
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('image', 'video', 'system')),
  job_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits added, negative for credits used
  reason TEXT NOT NULL, -- description of the transaction
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_job_type ON public.credit_transactions(job_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_job_id ON public.credit_transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit transactions" ON public.credit_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit transactions" ON public.credit_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update user credits when transaction is created
CREATE OR REPLACE FUNCTION public.update_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's credit balance
  UPDATE public.profiles 
  SET credits = credits + NEW.amount,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update user credits
CREATE TRIGGER update_user_credits_trigger
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_credits();

-- Function to deduct credits for a job
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_job_type TEXT,
  p_job_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insert the credit transaction
  INSERT INTO public.credit_transactions (
    user_id, job_type, job_id, amount, reason
  ) VALUES (
    p_user_id, p_job_type, p_job_id, -p_amount, p_reason
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits for a job completion or system credit
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_job_type TEXT,
  p_job_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Insert the credit transaction
  INSERT INTO public.credit_transactions (
    user_id, job_type, job_id, amount, reason
  ) VALUES (
    p_user_id, p_job_type, p_job_id, p_amount, p_reason
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- VIEWS
-- ===========================================

-- View: Video jobs with image context
CREATE OR REPLACE VIEW public.video_jobs_with_context AS
SELECT 
  v.video_job_id,
  v.status,
  v.generated_video_url,
  v.error_message,
  v.created_at,
  v.updated_at,
  i.id AS image_job_id,
  i.user_id,
  i.prompt,
  i.image_gen_url,
  i.image_analysis
FROM public.video_jobs v
JOIN public.image_jobs i ON v.image_job_id = i.id;

-- ===========================================
-- SCHEMA SUMMARY
-- ===========================================

-- Tables created:
-- 1. profiles - User profile information with credits
-- 2. image_jobs - Image generation job tracking
-- 3. video_jobs - Video generation job tracking
-- 4. credit_transactions - Credit usage tracking

-- Key features:
-- - Row Level Security (RLS) enabled on all tables
-- - Automatic timestamp updates
-- - Credit system integration
-- - Webhook integration for video processing
-- - Comprehensive indexing for performance
-- - User-friendly helper functions for credit management
