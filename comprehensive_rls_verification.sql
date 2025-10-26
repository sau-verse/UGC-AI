-- ===========================================
-- COMPREHENSIVE RLS ISSUE VERIFICATION
-- ===========================================

-- 1. Check the current RLS policies on the video_jobs table
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;

-- 2. Check if RLS is enabled on the table
SELECT 
  relname as table_name, 
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'video_jobs';

-- 3. Check if we can see the updated record with our current user context
SELECT 
  video_job_id, 
  status, 
  generated_video_url, 
  user_id,
  (user_id = auth.uid()) as user_matches_auth,
  (auth.uid() IS NULL) as auth_is_null
FROM video_jobs
WHERE video_job_id = '0e914628-3dbd-4481-b5c1-280b55fe141c';

-- 4. Check the current user context
SELECT 
  auth.uid() as current_uid,
  current_user as current_database_user;

-- 5. Test what the UPDATE policy condition evaluates to
SELECT 
  '0e914628-3dbd-4481-b5c1-280b55fe141c'::uuid as video_job_id,
  'ea7cbdd9-00f5-406e-b0d4-d0c1b92aceae'::uuid as user_id_from_record,
  auth.uid() as current_auth_uid,
  (auth.uid() = 'ea7cbdd9-00f5-406e-b0d4-d0c1b92aceae'::uuid) as condition_1_result,
  (auth.uid() IS NULL) as condition_2_result,
  (auth.uid() = 'ea7cbdd9-00f5-406e-b0d4-d0c1b92aceae'::uuid OR auth.uid() IS NULL) as combined_condition_result;