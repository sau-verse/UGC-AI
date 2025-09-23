import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface UserProfile {
  first_name: string | null
  last_name: string | null
}

/**
 * Custom hook for Supabase authentication
 * @returns AuthState object with user, loading, and error states
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true, // Start with loading true to prevent flash of unauthenticated content
    error: null
  })

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setAuthState({
            user: null,
            loading: false,
            error: error.message
          })
          return
        }
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        })
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: (error as Error).message
        })
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      
      // Handle different auth events
      switch (_event) {
        case 'SIGNED_IN':
          setAuthState({
            user: session?.user || null,
            loading: false,
            error: null
          })
          break
        case 'SIGNED_OUT':
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
          break
        case 'USER_UPDATED':
          setAuthState({
            user: session?.user || null,
            loading: false,
            error: null
          })
          break
        case 'TOKEN_REFRESHED':
          setAuthState({
            user: session?.user || null,
            loading: false,
            error: null
          })
          break
        default:
          // For other events, just update the user state
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            loading: false
          }))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Sign up a new user with email and password
   */
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }
      
      // For email signups, we don't automatically log in the user
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true, user: data.user }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }
      
      setAuthState(prev => ({ ...prev, loading: false, user: data.user }))
      return { success: true, user: data.user }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }
      
      // For OAuth, the user will be redirected to Google for authentication
      // The user state will be updated via the onAuthStateChange listener
      return { success: true, data }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }
      
      setAuthState({ user: null, loading: false, error: null })
      return { success: true }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get user profile (first name and last name)
   */
  const getUserProfile = async () => {
    try {
      if (!authState.user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', authState.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if user's email is confirmed
   */
  const isEmailConfirmed = async () => {
    try {
      if (!authState.user) return false;
      
      // If we already know the email is confirmed, return true
      if (authState.user.email_confirmed_at) return true;
      
      // Otherwise, fetch the latest user data
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error checking email confirmation:', error);
        return false;
      }
      
      return user?.email_confirmed_at ? true : false;
    } catch (error) {
      console.error('Error checking email confirmation:', error);
      return false;
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getUserProfile,
    isEmailConfirmed
  }
}

export default useAuth;
