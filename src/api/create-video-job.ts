import { supabase } from '@/lib/supabaseClient'

export interface CreateVideoJobRequest {
  image_job_id: string // Only required input according to requirements
}

export interface CreateVideoJobResponse {
  jobId?: string
  error?: string
}

/**
 * Create a new video job for AI video generation
 * @param jobData - The job data including only the required image_job_id
 * @returns The job ID or error message
 */
export async function createVideoJob(jobData: CreateVideoJobRequest): Promise<CreateVideoJobResponse> {
  try {
    console.log('Creating video job with data:', jobData);
    
    // Get the current user
    console.log('Getting current user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', { user, authError });
    
    if (authError || !user) {
      const errorMsg = authError ? `Authentication error: ${authError.message}` : 'No user found - authentication required'
      console.error('Authentication failed:', errorMsg)
      return { error: errorMsg }
    }
    
    console.log('User authenticated:', user.id, user.email);
    
    // Get the user_id from the image_job to ensure consistency
    console.log('Getting user_id from image_job...');
    const { data: imageJobData, error: imageJobError } = await supabase
      .from('image_jobs')
      .select('user_id')
      .eq('id', jobData.image_job_id)
      .single();
      
    if (imageJobError) {
      console.error('Error fetching image job:', imageJobError);
      return { error: `Failed to fetch image job: ${imageJobError.message}` };
    }
    
    console.log('Image job data:', imageJobData);
    
    // Prepare job data for insertion - explicitly set user_id
    const jobInsertData = {
      image_job_id: jobData.image_job_id,
      user_id: imageJobData.user_id, // Explicitly set user_id
      status: 'queued' // Default value from schema
      // created_at will be set automatically by the database
    };
    
    console.log('Inserting video job data:', jobInsertData);
    
    // Insert the new job into the video_jobs table
    const { data, error } = await supabase
      .from('video_jobs')
      .insert(jobInsertData)
      .select('video_job_id') // Use video_job_id as the primary key
      .single()
    
    console.log('Insert result:', { data, error });
    
    if (error) {
      console.error('Error creating video job:', error)
      return { error: `Failed to create video job: ${error.message}` }
    }
    
    console.log('Video job created successfully with ID:', data.video_job_id);
    return { jobId: data.video_job_id } // Return video_job_id as the primary key
  } catch (error) {
    console.error('Unexpected error creating video job:', error)
    return { error: `An unexpected error occurred: ${(error as Error).message}` }
  }
}