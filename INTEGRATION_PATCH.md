# Integration Patch for New Real-time Implementation

This document shows the exact changes needed to replace the current real-time implementation with the new one in the Generator component.

## File: src/pages/Generator.tsx

### 1. Update Import Statement

**Find:**
```typescript
import { useVideoJobStatusRealtime } from '@/hooks/supabase/useVideoJobStatusRealtime'
```

**Replace with:**
```typescript
import { useVideoJobStatusRealtimeNew as useVideoJobStatusRealtime } from '@/hooks/supabase/useVideoJobStatusRealtimeNew'
```

This change allows you to use the new implementation while keeping the same variable name, minimizing other code changes.

### 2. Update Hook Usage (if needed)

The hook interface is compatible, so no other changes should be necessary. However, if you need to access specific fields, make sure to use the correct field names:

- `video_job_id` instead of `id` for the job ID
- All other fields should remain the same

### 3. Verification Steps

After making the change:

1. Create a video job in the Generator
2. Check the browser console for logs prefixed with [NEW RT]
3. Verify that status updates are received when the job status changes
4. Confirm that the video URL is properly extracted when the job completes

### 4. Rollback Plan

If issues are encountered with the new implementation:

1. Revert the import statement to use the original hook
2. Delete the test files if not needed:
   - `src/components/VideoJobStatusTest.tsx`
   - `src/pages/TestRealtime.tsx`
3. The original implementation will still be available at `src/hooks/supabase/useVideoJobStatusRealtime.ts`

## Additional Notes

The new implementation includes enhanced logging to help debug any issues. Look for console messages with the [NEW RT] prefix to trace the real-time update flow.