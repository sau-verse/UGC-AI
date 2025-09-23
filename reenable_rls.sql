-- ===========================================
-- RE-ENABLE RLS AFTER APPLYING FIX
-- ===========================================

-- Re-enable RLS on video_jobs table
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'video_jobs';

-- Verify the policies are in place
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;
