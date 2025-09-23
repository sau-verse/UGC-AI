-- ===========================================
-- VERIFY VIDEO JOBS RLS ISSUE
-- ===========================================

-- First, check the current RLS policies on the video_jobs table
SELECT polname, polrelid::regclass, polcmd, polqual, polwithcheck
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;

-- Check if RLS is enabled on the table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'video_jobs';

-- Check if we can see the updated record with our current user
SELECT video_job_id, status, generated_video_url, user_id
FROM video_jobs
WHERE video_job_id = '0e914628-3dbd-4481-b5c1-280b55fe141c';

-- Check the current user
SELECT auth.uid();