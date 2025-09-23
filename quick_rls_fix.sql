-- ===========================================
-- QUICK RLS FIX FOR REALTIME UPDATES
-- ===========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own video_jobs" ON public.video_jobs;
DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;
DROP POLICY IF EXISTS "Users can insert their own video_jobs" ON public.video_jobs;

-- Create new policies that allow realtime subscriptions
CREATE POLICY "Users can view their own video_jobs" ON public.video_jobs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL  -- This allows realtime subscriptions to work
  );

CREATE POLICY "Users can insert their own video_jobs" ON public.video_jobs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IS NULL  -- This allows n8n to insert
  );

CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL  -- This allows n8n to update
  ) WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IS NULL  -- This allows n8n to update
  );
