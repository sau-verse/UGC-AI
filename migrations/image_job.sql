-- ===========================================
-- IMAGE JOBS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.image_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Input data
  prompt TEXT NOT NULL,
  aspect_ratio TEXT CHECK (aspect_ratio IN ('portrait', 'landscape')),
  input_image TEXT, -- input image URL
  image_analysis TEXT, -- analysis of the input image

  -- Status flow
  status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'done', 'failed')),

  -- Outputs
  image_gen_url TEXT, -- final generated image

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

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_image_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_image_jobs_updated_at ON public.image_jobs;

CREATE TRIGGER update_image_jobs_updated_at
  BEFORE UPDATE ON public.image_jobs
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_image_jobs_updated_at_column();