import { supabase } from '@/lib/supabaseClient'

export async function verifyTables() {
  try {
    // Check if image_jobs table exists by trying to query it
    const { data: imageJobs, error: imageJobsError } = await supabase
      .from('image_jobs')
      .select('id')
      .limit(1)

    console.log('Image jobs table check:', { imageJobs, imageJobsError })

    // Check if video_jobs table exists by trying to query it
    const { data: videoJobs, error: videoJobsError } = await supabase
      .from('video_jobs')
      .select('video_job_id')
      .limit(1)

    console.log('Video jobs table check:', { videoJobs, videoJobsError })

    // Check if profiles table exists by trying to query it
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    console.log('Profiles table check:', { profiles, profilesError })

    return {
      imageJobsExists: !imageJobsError,
      videoJobsExists: !videoJobsError,
      profilesExists: !profilesError,
      errors: {
        imageJobs: imageJobsError,
        videoJobs: videoJobsError,
        profiles: profilesError
      }
    }
  } catch (error) {
    console.error('Error verifying tables:', error)
    return {
      imageJobsExists: false,
      videoJobsExists: false,
      profilesExists: false,
      errors: {
        general: error
      }
    }
  }
}