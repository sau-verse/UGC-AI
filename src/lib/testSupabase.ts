import { supabase } from '@/lib/supabaseClient'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check:', { user: user?.id, authError })
    
    // Test 2: Try to list tables in the database
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    console.log('Tables in database:', { tables, tablesError })
    
    // Test 3: Try to access image_jobs table directly
    const { data: imageJobs, error: imageJobsError } = await supabase
      .from('image_jobs')
      .select('count()')
    
    console.log('Image jobs table access:', { imageJobs, imageJobsError })
    
    // Test 4: Try to access video_jobs table directly
    const { data: videoJobs, error: videoJobsError } = await supabase
      .from('video_jobs')
      .select('count()')
    
    console.log('Video jobs table access:', { videoJobs, videoJobsError })
    
    return {
      auth: { user: user?.id, error: authError },
      tables: { data: tables, error: tablesError },
      imageJobs: { data: imageJobs, error: imageJobsError },
      videoJobs: { data: videoJobs, error: videoJobsError }
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return { error }
  }
}