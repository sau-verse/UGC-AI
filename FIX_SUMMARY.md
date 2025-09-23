# Video Job Real-time Updates Fix Summary

## Issues Identified

1. **Incorrect Primary Key Reference**: The code was referencing `video_job_id` instead of `id` for the primary key column
2. **Commented Out Filter**: The real-time subscription filter was commented out, causing it to receive updates for all jobs
3. **Inconsistent Field Names**: Various parts of the code were using different field names for the same concept

## Fixes Applied

### 1. Fixed Primary Key References

**File**: `src/api/create-video-job.ts`
- Changed `.select('video_job_id')` to `.select('id')`
- Updated log and return statements to use `data.id` instead of `data.video_job_id`

**File**: `src/api/update-video-job.ts`
- Changed `.eq('video_job_id', jobData.jobId)` to `.eq('id', jobData.jobId)`

**File**: `src/hooks/supabase/useVideoJobStatusRealtime.ts`
- Changed `.eq('video_job_id', jobId)` to `.eq('id', jobId)`
- Changed filter from `video_job_id=eq.${jobId}` to `id=eq.${jobId}`

### 2. Fixed Real-time Subscription Filter

**File**: `src/hooks/supabase/useVideoJobStatusRealtime.ts`
- Uncommented and corrected the filter to properly filter for the specific job
- Removed redundant client-side filtering code

### 3. Updated API Documentation

**File**: `src/routes/api/update-video-job.ts`
- Updated error message from "video_job_id is required" to "job ID is required"
- Updated example to use "id" instead of "video_job_id"

## Root Cause

The primary issue was that the video_jobs table uses `id` as its primary key column, but the code was trying to reference it as `video_job_id`. This caused:

1. The create function to return undefined as the job ID
2. The real-time subscription to filter for undefined job IDs
3. The update function to fail to find jobs to update

## Verification

After applying these fixes, the real-time updates should work correctly:

1. When a video job is created, it will return a valid job ID
2. The real-time subscription will properly filter for that specific job
3. When the backend updates the job status to "done" with a video URL, the frontend will receive the update
4. The video will automatically appear in the preview area

## Testing Steps

1. Create a video job in the Generator page
2. Monitor the browser console for these log messages:
   - "Successfully subscribed to video job updates"
   - "Realtime video job UPDATE received" when the job status changes
   - "Status changed to done" when the job completes
   - "Found generated_video_url in update" with the video URL

3. The video should now automatically appear in the preview area when the job completes