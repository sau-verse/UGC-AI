import { supabase } from '@/lib/supabaseClient'

export interface UpdateVideoJobRequest {
  jobId: string
  status?: 'queued' | 'processing' | 'done' | 'failed'
  generated_video_url?: string
  image_analysis?: string
}

export interface UpdateVideoJobResponse {
  success: boolean
  error?: string
}

/**
 * Update a video job in the Supabase database
 * @param jobData - The video job data to update including jobId and fields to update
 * @returns Success status and error message if any
 */
export async function updateVideoJob(jobData: UpdateVideoJobRequest): Promise<UpdateVideoJobResponse> {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Allow updates from n8n without user authentication
      console.log('No user authenticated, but allowing update (likely from n8n)');
    }
    
    // Prepare the update object with only the fields that are provided
    const updateObject: Record<string, unknown> = {}
    if (jobData.status) updateObject.status = jobData.status
    if (jobData.generated_video_url) updateObject.generated_video_url = jobData.generated_video_url
    if (jobData.image_analysis) updateObject.image_analysis = jobData.image_analysis
    
    console.log('Updating video job with data:', { jobId: jobData.jobId, ...updateObject });
    
    // Update the job in the video_jobs table
    const { error } = await supabase
      .from('video_jobs')
      .update(updateObject)
      .eq('video_job_id', jobData.jobId) // Use video_job_id as the primary key
    
    if (error) {
      console.error('Error updating video job:', error)
      return { success: false, error: `Failed to update video job: ${error.message}` }
    }
    
    console.log('Video job updated successfully');
    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating video job:', error)
    return { success: false, error: `An unexpected error occurred: ${(error as Error).message}` }
  }
}