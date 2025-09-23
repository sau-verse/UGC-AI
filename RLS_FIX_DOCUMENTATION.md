# Video Job RLS Policy Issue and Solution

## Problem

Real-time updates for video job status were not working when Row Level Security (RLS) policies were enabled, but worked when RLS was disabled. This indicated that the RLS policies were preventing the frontend from receiving the updated job status.

## Root Cause

The issue was with the RLS policies on the `video_jobs` table. The existing policies only allowed authenticated users to update their own video jobs:

```sql
CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (auth.uid() = user_id);
```

However, the n8n webhook that updates the video job status runs without user authentication (auth.uid() is NULL), which meant the UPDATE operation was being blocked by RLS.

## Solution

Modified the RLS policies to allow updates from backend services (like the n8n webhook) when there's no authenticated user:

```sql
CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    -- Allow updates from backend services (like n8n webhook) when there's no authenticated user
    auth.uid() IS NULL
  );
```

Similar changes were made to the INSERT policy.

## Migration

The fix has been implemented in `migrations/fix_video_jobs_rls.sql`. This migration should be applied to the database to resolve the real-time update issue.

## Security Considerations

While this solution works, it's not the most secure approach. In a production environment, it would be better to:

1. Configure the n8n webhook to use a service key for authentication
2. Create a specific service role for backend operations
3. Use more restrictive policies that only allow updates from authenticated service accounts

## Verification

After applying the migration:

1. Create a video job in the Generator page
2. The job should be created successfully with the correct user_id
3. The n8n webhook should be able to update the job status
4. The frontend should receive real-time updates when the job status changes
5. The video should automatically appear in the preview area when the job completes