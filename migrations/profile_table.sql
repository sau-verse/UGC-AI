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
