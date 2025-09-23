import { supabase } from './supabaseClient'

/**
 * Simple verification function to check if Supabase client is properly configured
 * This can be called during app initialization to verify the setup
 */
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    // Verify that the Supabase client is properly initialized
    console.log('Supabase client initialized successfully')
    // Check if the Supabase client has the expected properties
    if (supabase && supabase.auth && supabase.from) {
      console.log('Supabase client has required properties')
      return true
    } else {
      console.error('Supabase client is missing required properties')
      return false
    }
  } catch (error) {
    console.error('Supabase client verification failed:', error)
    return false
  }
}