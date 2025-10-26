import { updateVideoJob, UpdateVideoJobRequest } from '@/api/update-video-job'

/**
 * API endpoint for updating video job status
 * This endpoint can be called by the n8n workflow to update video job status in Supabase
 * 
 * @param request - The request object containing video job update data
 * @returns Response with success status or error
 */
export async function updateVideoJobAPI(request: Request): Promise<Response> {
  try {
    // Parse the request body
    const rawData: any = await request.json()
    
    // Log the raw data for debugging
    console.log('Raw data received in updateVideoJobAPI:', rawData);
    
    // Use specific field names without aliases
    const jobData: UpdateVideoJobRequest = {
      jobId: rawData.video_job_id || rawData.jobId || rawData.id || rawData.job_id,
      status: rawData.status,
      generated_video_url: rawData.generated_video_url
    };
    
    // Log the processed data
    console.log('Processed job data:', jobData);
    
    // Validate required fields
    if (!jobData.jobId) {
      return new Response(
        JSON.stringify({ success: false, error: 'video_job_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Update the video job
    const result = await updateVideoJob(jobData)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' }
      })
  } catch (error) {
    console.error('Error in updateVideoJobAPI:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }
      })
  }
}

// Example usage in n8n:
// POST to /api/update-video-job with body:
// {
//   "video_job_id": "uuid-of-the-video-job",
//   "status": "done",
//   "generated_video_url": "https://example.com/video.mp4"
// }