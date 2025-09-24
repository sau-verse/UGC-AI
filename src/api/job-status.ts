import { supabase } from '@/lib/supabaseClient'

export interface JobStatusResponse {
  id: string
  status: 'queued' | 'processing' | 'done' | 'failed'
  generated_image_url?: string
  generated_video_url?: string
  image_analysis?: string
  error?: string
}

/**
 * Get the status of a job
 * @param jobId - The ID of the job to check
 * @returns The job status and URLs if available
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        id: jobId,
        status: 'failed',
        error: 'Authentication required' 
      }
    }
    
    // Fetch the job from the database
    const { data, error } = await supabase
      .from('image_jobs')
      .select('id, status, image_gen_url, generated_video_url, image_analysis')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching job status:', error)
      return { 
        id: jobId,
        status: 'failed',
        error: 'Failed to fetch job status' 
      }
    }
    
    if (!data) {
      return { 
        id: jobId,
        status: 'failed',
        error: 'Job not found' 
      }
    }
    
    return {
      id: data.id,
      status: data.status,
      generated_image_url: data.image_gen_url,
      generated_video_url: data.generated_video_url,
      image_analysis: data.image_analysis
    }
  } catch (error) {
    console.error('Unexpected error fetching job status:', error)
    return { 
      id: jobId,
      status: 'failed',
      error: 'An unexpected error occurred' 
    }
  }
}