import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/supabase/useAuth';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isEmailConfirmed } = useAuth();
  const location = useLocation();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  // Check email confirmation status for email signup users
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (user && !user.email_confirmed_at) {
        // For users who signed up with email, check if their email is confirmed
        setEmailVerified(false); // Default to false while checking
        try {
          const confirmed = await isEmailConfirmed();
          setEmailVerified(confirmed);
        } catch (error) {
          console.error('Error checking email confirmation:', error);
          // In case of error, we'll assume the email is not confirmed for safety
          setEmailVerified(false);
        }
        setAuthCheckComplete(true);
      } else if (user) {
        // For OAuth users or users with already confirmed emails
        setEmailVerified(true);
        setAuthCheckComplete(true);
      } else {
        // For unauthenticated users
        setEmailVerified(true);
        setAuthCheckComplete(true);
      }
    };

    if (!loading && user !== undefined) {
      checkEmailConfirmation();
    } else if (loading === false && user === null) {
      // If user is explicitly null (not undefined), auth check is complete
      setAuthCheckComplete(true);
    }
  }, [user, loading, isEmailConfirmed]);

  // While checking auth state, show loading spinner
  // This prevents showing protected content before auth status is determined
  if (loading || !authCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // If user is not authenticated or email is not verified, redirect to login page
  if (!user || !emailVerified) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user is authenticated, render children with a smooth transition
  return (
    <div className="fade-in">
      {children}
    </div>
  );
};

export default ProtectedRoute;