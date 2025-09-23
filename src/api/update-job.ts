import { supabase } from '@/lib/supabaseClient'

export interface UpdateJobRequest {
  jobId: string
  status?: 'queued' | 'processing' | 'done' | 'failed'
  generated_image_url?: string
  generated_video_url?: string
  image_analysis?: string
}

export interface UpdateJobResponse {
  success: boolean
  error?: string
}

/**
 * Update a job in the Supabase database
 * @param jobData - The job data to update including jobId and fields to update
 * @returns Success status and error message if any
 */
export async function updateJob(jobData: UpdateJobRequest): Promise<UpdateJobResponse> {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }
    
    // Prepare the update object with only the fields that are provided
    const updateObject: Record<string, unknown> = {}
    if (jobData.status) updateObject.status = jobData.status
    if (jobData.generated_image_url) updateObject.image_gen_url = jobData.generated_image_url  // Changed from generated_image_url to image_gen_url
    if (jobData.generated_video_url) updateObject.generated_video_url = jobData.generated_video_url
    if (jobData.image_analysis) updateObject.image_analysis = jobData.image_analysis
    
    // Update the job in the database
    const { error } = await supabase
      .from('image_jobs')
      .update(updateObject)
      .eq('id', jobData.jobId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error updating job:', error)
      return { success: false, error: 'Failed to update job' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating job:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}