# API Routes

This directory contains the API route handlers for the Supabase integration. In a typical Vite/React application, these functions are called directly from the frontend hooks. However, if you need to implement these as actual API endpoints (for example, in a Node.js backend), you can use these handlers as a reference.

## Route Handlers

### `/api/create-job`

Handler for creating a new job in the Supabase database.

### `/api/job-status/[id]`

Handler for retrieving the status of a specific job.

### `/api/update-job`

Handler for updating job status and URLs in the Supabase database. This endpoint can be called by the n8n workflow to update job status.

## Implementation Notes

These handlers are implemented in the `src/api` directory as functions that can be called directly from React components. The frontend hooks in `src/hooks/supabase` wrap these functions to provide React state management and side effects.

If you need to implement these as actual HTTP endpoints, you would:

1. Create HTTP route handlers that call these functions
2. Add proper HTTP method handling (POST for create-job and update-job, GET for job-status)
3. Add request validation and error handling
4. Implement proper response formatting

## Example Express.js Implementation

```javascript
// Example implementation for Express.js backend
import express from 'express';
import { createJob, getJobStatus } from '../../api/create-job';
import { updateJob } from '../../api/update-job';

const router = express.Router();

// Create job endpoint
router.post('/create-job', async (req, res) => {
  try {
    const result = await createJob(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json({ jobId: result.jobId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job status endpoint
router.get('/job-status/:id', async (req, res) => {
  try {
    const result = await getJobStatus(req.params.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job endpoint
router.post('/update-job', async (req, res) => {
  try {
    const result = await updateJob(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
```