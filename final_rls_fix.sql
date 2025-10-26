-- ===========================================
-- FINAL RLS FIX FOR VIDEO JOBS REAL-TIME UPDATES
-- ===========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;
DROP POLICY IF EXISTS "Users can insert their own video_jobs" ON public.video_jobs;

-- Create new policies that allow both authenticated users and backend services
CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL
  );

CREATE POLICY "Users can insert their own video_jobs" ON public.video_jobs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IS NULL
  );

-- Verify the new policies
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;