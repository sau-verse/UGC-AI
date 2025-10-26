-- ===========================================
-- FIX VIDEO JOBS RLS POLICIES
-- ===========================================

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;

-- Create a new update policy that allows both authenticated users and backend service to update
CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    -- Allow updates from backend services (like n8n webhook) when there's no authenticated user
    auth.uid() IS NULL
  );

-- Also add a policy for INSERT that allows backend services
DROP POLICY IF EXISTS "Users can insert their own video_jobs" ON public.video_jobs;

CREATE POLICY "Users can insert their own video_jobs" ON public.video_jobs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    -- Allow inserts from backend services when there's no authenticated user
    auth.uid() IS NULL
  );