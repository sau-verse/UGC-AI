-- ===========================================
-- CHECK AND FIX RLS POLICIES
-- ===========================================

-- 1. Check current RLS policies
\echo 'Current RLS policies on video_jobs table:'
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;

-- 2. Check if RLS is enabled
\echo 'RLS status:'
SELECT 
  relname as table_name, 
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'video_jobs';

-- 3. Check current authentication context
\echo 'Current authentication context:'
SELECT 
  auth.uid() as current_uid,
  current_user as current_database_user;

-- 4. If the UPDATE policy doesn't include auth.uid() IS NULL, fix it
\echo 'Applying RLS fix if needed...'
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polrelid = 'video_jobs'::regclass 
    AND polname = 'Users can update their own video_jobs'
    AND polqual::text NOT LIKE '%auth.uid() IS NULL%'
  ) THEN
    DROP POLICY "Users can update their own video_jobs" ON public.video_jobs;
    
    CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
      FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IS NULL
      );
    
    RAISE NOTICE 'RLS policy updated to allow updates when auth.uid() is NULL';
  ELSE
    RAISE NOTICE 'RLS policy already allows updates when auth.uid() is NULL';
  END IF;
END $$;

-- 5. Verify the fix
\echo 'Verifying updated policies:'
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;