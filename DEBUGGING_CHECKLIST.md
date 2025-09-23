# Real-time Update Debugging Checklist

## 1. Verify RLS Policies

Run this query in your Supabase SQL editor to check current policies:

```sql
SELECT 
  polname as policy_name,
  polrelid::regclass as table_name,
  polcmd as command_type,
  polqual as using_condition,
  polwithcheck as with_check_condition
FROM pg_policy
WHERE polrelid = 'video_jobs'::regclass;
```

Look for the "Users can update their own video_jobs" policy and check its `using_condition`.

## 2. Check Authentication Context

Run this query to check your current authentication context:

```sql
SELECT 
  auth.uid() as current_uid,
  current_user as current_database_user;
```

If `current_uid` is `null`, that's the issue.

## 3. Apply the RLS Fix

If the `using_condition` doesn't include `auth.uid() IS NULL`, apply the fix:

```sql
DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;

CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL
  );
```

## 4. Test with Manual Update

Run this test query to see if real-time updates work:

```sql
UPDATE video_jobs 
SET status = 'done', 
    generated_video_url = 'https://example.com/test-video.mp4',
    updated_at = NOW()
WHERE video_job_id = '58d10204-9223-44af-8d1b-b59a5b824f08';
```

## 5. Monitor Console Logs

When you run the manual update, you should see in your browser console:

1. "Realtime UPDATE old:" and "Realtime UPDATE new:" messages
2. "New video URL: https://example.com/test-video.mp4"
3. "Video job completed ✅"

If you don't see these messages, the issue is with the real-time subscription setup.

## 6. Check for Debug Messages

You should also see "DEBUG ALL UPDATES:" messages if the debug subscription is working.

## Common Issues and Solutions

1. **RLS Policy Issue**: Apply the fix above
2. **Subscription Filter Issue**: Check that the filter matches the job ID exactly
3. **Network Issues**: Ensure your Supabase connection is working
4. **Channel Issues**: Make sure the channel is properly subscribed