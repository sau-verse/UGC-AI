import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that we have the required environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to refresh the Supabase client schema
export const refreshSupabaseClient = () => {
  console.log('Refreshing Supabase client...')
  // In a real scenario, you might want to recreate the client or clear caches
  // For now, we'll just log that a refresh was requested
  // The actual refresh will happen when the dev server restarts
}