-- ===========================================
-- TEST REAL-TIME FUNCTIONALITY
-- ===========================================

-- First, let's manually update a video job to see if we get real-time updates
UPDATE video_jobs 
SET status = 'processing', updated_at = NOW()
WHERE video_job_id = '58d10204-9223-44af-8d1b-b59a5b824f08';

-- Then update it to 'done' with a test URL
UPDATE video_jobs 
SET status = 'done', 
    generated_video_url = 'https://example.com/test-video.mp4',
    updated_at = NOW()
WHERE video_job_id = '58d10204-9223-44af-8d1b-b59a5b824f08';