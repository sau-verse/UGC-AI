import { supabase } from '@/lib/supabaseClient'

export interface VideoJobStatusResponse {
  id: string
  status: 'queued' | 'processing' | 'done' | 'failed'
  image_gen_url?: string
  image_analysis?: string
  generated_video_url?: string
  error?: string
}

/**
 * Get the status of a video job
 * @param jobId - The ID of the video job to check
 * @returns The video job status and URLs if available
 */
export async function getVideoJobStatus(jobId: string): Promise<VideoJobStatusResponse> {
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
    
    // Fetch the video job from the database
    // Since the table is fully normalized, we need to join with image_jobs to get user_id and image_gen_url
    const { data, error } = await supabase
      .from('video_jobs')
      .select(`
        id,
        status,
        generated_video_url,
        error_message,
        image_jobs (
          image_gen_url,
          image_analysis,
          user_id
        )
      `)
      .eq('id', jobId)
      // We can't filter by user_id directly since it's in the joined table
      .single()
    
    if (error) {
      console.error('Error fetching video job status:', error)
      return { 
        id: jobId,
        status: 'failed',
        error: 'Failed to fetch video job status' 
      }
    }
    
    if (!data) {
      return { 
        id: jobId,
        status: 'failed',
        error: 'Video job not found' 
      }
    }
    
    // Check if the user has permission to access this job
    // image_jobs is an array, so we need to check the first element
    if (data.image_jobs && data.image_jobs.length > 0) {
      if (data.image_jobs[0].user_id !== user.id) {
        return { 
          id: jobId,
          status: 'failed',
          error: 'Access denied' 
        }
      }
    } else {
      return { 
        id: jobId,
        status: 'failed',
        error: 'Image job not found' 
      }
    }
    
    return {
      id: data.id,
      status: data.status,
      image_gen_url: data.image_jobs[0].image_gen_url,
      image_analysis: data.image_jobs[0].image_analysis,
      generated_video_url: data.generated_video_url,
      error: data.error_message
    }
  } catch (error) {
    console.error('Unexpected error fetching video job status:', error)
    return { 
      id: jobId,
      status: 'failed',
      error: 'An unexpected error occurred' 
    }
  }
}