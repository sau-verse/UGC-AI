-- ===========================================
-- TEST REAL-TIME UPDATES AFTER RLS FIX
-- ===========================================

-- Test the real-time update by changing the status to 'processing'
\echo 'Testing real-time update - setting status to processing...'
UPDATE video_jobs 
SET status = 'processing', 
    updated_at = NOW()
WHERE video_job_id = '1f1e8d52-3733-4e9b-9792-14395911ef5f';

-- Wait a moment and then set it to 'done' with a test video URL
\echo 'Setting status to done with test video URL...'
UPDATE video_jobs 
SET status = 'done', 
    generated_video_url = 'https://example.com/test-video.mp4',
    updated_at = NOW()
WHERE video_job_id = '1f1e8d52-3733-4e9b-9792-14395911ef5f';

-- Verify the update was applied
\echo 'Verifying the update was applied:'
SELECT 
  video_job_id,
  status,
  generated_video_url,
  updated_at
FROM video_jobs
WHERE video_job_id = '1f1e8d52-3733-4e9b-9792-14395911ef5f';