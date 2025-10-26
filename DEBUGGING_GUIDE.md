# Real-time Updates Debugging Guide

## Debugging Steps

1. **Check the DEBUG ALL UPDATES log**:
   - Look for "DEBUG ALL UPDATES:" messages in the console
   - This will show all UPDATE events for the video_jobs table, regardless of job ID

2. **Check the filtered UPDATE log**:
   - Look for "Realtime UPDATE old:" and "Realtime UPDATE new:" messages
   - These should only appear for updates to the specific job being monitored

3. **Check for INSERT events**:
   - Look for "Realtime video job INSERT received:" messages
   - These should appear when the job is first created

## How to Interpret the Results

### Scenario 1: Filter Issue
**Symptoms**:
- You see "DEBUG ALL UPDATES:" with the final job update
- You DON'T see "Realtime UPDATE old:" and "Realtime UPDATE new:" for the final update

**Cause**: 
- The filter is not working correctly
- The job ID in the database doesn't match the job ID being used in the filter

**Solution**:
- Verify that the job ID being passed to the hook matches the video_job_id in the database
- Check that the filter syntax is correct: `video_job_id=eq.${jobId}`

### Scenario 2: No Updates at All
**Symptoms**:
- You DON'T see "DEBUG ALL UPDATES:" with the final job update
- You DON'T see "Realtime UPDATE old:" and "Realtime UPDATE new:" for the final update

**Cause**:
- The backend is not updating the database correctly
- There's an issue with the Supabase real-time functionality
- RLS policies are preventing the update

**Solution**:
- Verify that the backend is actually updating the database record
- Check the Supabase dashboard to see if the record is being updated
- Verify RLS policies are correctly configured

### Scenario 3: State Not Updating
**Symptoms**:
- You see "Realtime UPDATE old:" and "Realtime UPDATE new:" with the correct data
- But the UI doesn't update to show the video

**Cause**:
- The setJob() call is not triggering a re-render
- There's an issue with how the job data is being processed in the component

**Solution**:
- Verify that setJob() is being called with the correct data
- Check that the component is properly consuming the job data from the hook

## What to Look For in the Logs

1. **Job Creation**:
   ```
   Realtime video job INSERT received: {video_job_id: "...", status: "queued", ...}
   ```

2. **Job Processing**:
   ```
   Realtime UPDATE old: {status: "queued", ...}
   Realtime UPDATE new: {status: "processing", ...}
   ```

3. **Job Completion**:
   ```
   Realtime UPDATE old: {status: "processing", generated_video_url: null, ...}
   Realtime UPDATE new: {status: "done", generated_video_url: "https://...", ...}
   ```

4. **Debug All Updates**:
   ```
   DEBUG ALL UPDATES: {old: {...}, new: {...}}
   ```

## Common Issues and Solutions

1. **Job ID Mismatch**:
   - Ensure the job ID passed to the hook exactly matches the video_job_id in the database
   - Check for any transformations or formatting differences

2. **Filter Syntax**:
   - Ensure the filter syntax is exactly: `video_job_id=eq.${jobId}`
   - Check for any extra spaces or characters

3. **Database Updates**:
   - Verify the backend is actually updating the database
   - Check the Supabase table browser to see the current record state

4. **RLS Policies**:
   - Ensure the user has permission to see the updated record
   - Check that the user_id in the record matches auth.uid()