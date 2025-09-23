-- ===========================================
-- MINIMAL RLS FIX FOR VIDEO JOBS
-- ===========================================

-- Drop and recreate only the UPDATE policy to allow backend services
DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;

CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL
  );