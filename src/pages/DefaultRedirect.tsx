import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/supabase/useAuth';
import { useNavigate } from 'react-router-dom';

const DefaultRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to Generator page
        navigate('/generate');
      } else {
        // User is not authenticated, redirect to homepage
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render nothing while redirecting
  return null;
};

export default DefaultRedirect;