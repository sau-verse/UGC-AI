# How to Apply the RLS Fix for Video Jobs

## Problem
Real-time updates for video job status are not working when Row Level Security (RLS) policies are enabled, but work when RLS is disabled. This indicates that the RLS policies are preventing the n8n webhook from updating video job records.

## Solution
Apply the RLS fix migration that modifies the policies to allow updates from backend services.

## Steps to Apply the Fix

1. **Start your Supabase local development stack** (if not already running):
   ```
   npx supabase start
   ```

2. **Apply the migration**:
   ```
   npx supabase migration up
   ```

   This will apply the `migrations/fix_video_jobs_rls.sql` file which contains:

   ```sql
   -- Drop the existing update policy
   DROP POLICY IF EXISTS "Users can update their own video_jobs" ON public.video_jobs;

   -- Create a new update policy that allows both authenticated users and backend service to update
   CREATE POLICY "Users can update their own video_jobs" ON public.video_jobs
     FOR UPDATE USING (
       auth.uid() = user_id OR 
       -- Allow updates from backend services (like n8n webhook) when there's no authenticated user
       auth.uid() IS NULL
     );

   -- Also add a policy for INSERT that allows backend services
   DROP POLICY IF EXISTS "Users can insert their own video_jobs" ON public.video_jobs;

   CREATE POLICY "Users can insert their own video_jobs" ON public.video_jobs
     FOR INSERT WITH CHECK (
       auth.uid() = user_id OR 
       -- Allow inserts from backend services when there's no authenticated user
       auth.uid() IS NULL
     );
   ```

3. **Verify the fix**:
   - Create a new video job in the Generator page
   - Monitor the console logs for real-time updates
   - The video should appear in the preview area when the job completes

## Alternative Manual Application

If you can't use the migration command, you can manually apply the SQL statements in the Supabase SQL editor:

1. Go to your Supabase dashboard
2. Open the SQL editor
3. Run the SQL statements from the migration file
4. Verify that the policies have been updated

## Security Note

This fix allows updates when there's no authenticated user, which works for the n8n webhook but is not the most secure approach. For production environments, consider:

1. Configuring the n8n webhook to use a service key for authentication
2. Creating a specific service role for backend operations
3. Using more restrictive policies that only allow updates from authenticated service accounts