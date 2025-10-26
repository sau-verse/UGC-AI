import { supabase } from '@/lib/supabaseClient'

export interface CreateJobRequest {
  prompt: string
  aspect_ratio: 'portrait' | 'landscape'
  input_image?: string
}

export interface CreateJobResponse {
  jobId?: string
  error?: string
}

/**
 * Create a new job for AI image/video generation
 * @param jobData - The job data including prompt, aspect_ratio, and optional input_image
 * @returns The job ID or error message
 */
export async function createJob(jobData: CreateJobRequest): Promise<CreateJobResponse> {
  try {
    console.log('Creating job with data:', jobData);
    
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
    
    // Prepare job data for insertion
    const jobInsertData = {
      user_id: user.id,
      prompt: jobData.prompt,
      aspect_ratio: jobData.aspect_ratio,
      input_image_url: jobData.input_image, // Changed from input_image to input_image_url to match the database schema
      status: 'queued'
    };
    
    console.log('Inserting job data:', jobInsertData);
    
    // Insert the new job into the database
    const { data, error } = await supabase
      .from('image_jobs')
      .insert(jobInsertData)
      .select('id')
      .single()
    
    console.log('Insert result:', { data, error });
    
    if (error) {
      console.error('Error creating job:', error)
      return { error: `Failed to create job: ${error.message}` }
    }
    
    console.log('Job created successfully with ID:', data.id);
    return { jobId: data.id }
  } catch (error) {
    console.error('Unexpected error creating job:', error)
    return { error: `An unexpected error occurred: ${(error as Error).message}` }
  }
}