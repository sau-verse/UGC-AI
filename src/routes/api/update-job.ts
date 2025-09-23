import { updateJob, UpdateJobRequest } from '@/api/update-job'

/**
 * API endpoint for updating job status
 * This endpoint can be called by the n8n workflow to update job status in Supabase
 * 
 * @param request - The request object containing job update data
 * @returns Response with success status or error
 */
export async function updateJobAPI(request: Request): Promise<Response> {
  try {
    // Parse the request body
    const jobData: UpdateJobRequest = await request.json()
    
    // Validate required fields
    if (!jobData.jobId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Job ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Update the job
    const result = await updateJob(jobData)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in updateJobAPI:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Example usage in n8n:
// POST to /api/update-job with body:
// {
//   "jobId": "uuid-of-the-job",
//   "status": "processing",
//   "generated_image_url": "https://example.com/image.jpg"
// }