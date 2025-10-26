/**
 * Simple check to verify Supabase client import
 * This file can be imported to verify the Supabase client setup
 */
import { supabase } from './supabaseClient'

// Export a function that can be called to verify the client
export function checkSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client failed to initialize')
  }
  console.log('Supabase client is ready')
  return true
}