import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from '@/hooks/supabase/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Examples', href: '#examples' },
  ];

  // Fetch user profile when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();

          if (error) {
            // Handle specific error cases
            if (error.code === 'PGRST205') {
              // Table not found in schema cache - likely a configuration issue
              console.warn('Profiles table not accessible through API, using fallback display name');
              // We'll rely on the fallback methods in getDisplayName
              setUserProfile(null);
              return;
            } else if (error.code !== 'PGRST116') { // PGRST116 is "Record not found"
              console.error('Error fetching user profile:', error);
              return;
            }
          }

          if (data) {
            setUserProfile(data);
          } else {
            // If no profile exists, create one
            console.log('No profile found, creating new profile for user');
            await createProfile(user);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    const createProfile = async (user: any) => {
      try {
        // Extract name from user metadata if available
        let firstName = null;
        let lastName = null;
        
        if (user?.user_metadata) {
          if (user.user_metadata.full_name) {
            const nameParts = user.user_metadata.full_name.split(' ');
            firstName = nameParts[0] || null;
            lastName = nameParts.slice(1).join(' ') || null;
          } else if (user.user_metadata.first_name) {
            firstName = user.user_metadata.first_name;
            lastName = user.user_metadata.last_name || null;
          }
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) {
          // Handle the case where we can't create a profile due to API access issues
          if (error.code === 'PGRST205') {
            console.warn('Unable to create profile due to API configuration issues, using fallback display name');
          } else {
            console.error('Error creating profile:', error);
          }
        } else if (data) {
          setUserProfile(data);
          console.log('Profile created successfully');
        }
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    // Redirect to homepage after logout
    navigate('/');
  };

  // Get display name for the user
  const getDisplayName = () => {
    // First try to get name from our profiles table
    if (userProfile) {
      if (userProfile.first_name && userProfile.last_name) {
        return `${userProfile.first_name} ${userProfile.last_name}`;
      } else if (userProfile.first_name) {
        return userProfile.first_name;
      } else if (userProfile.last_name) {
        return userProfile.last_name;
      }
    }
    
    // If not available, try to get name from user metadata (Google OAuth)
    if (user?.user_metadata) {
      if (user.user_metadata.full_name) {
        return user.user_metadata.full_name;
      } else if (user.user_metadata.first_name && user.user_metadata.last_name) {
        return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
      } else if (user.user_metadata.first_name) {
        return user.user_metadata.first_name;
      } else if (user.user_metadata.last_name) {
        return user.user_metadata.last_name;
      }
    }
    
    // Fallback to email if no name is available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/generate" : "/"} className="flex items-center space-x-2 hover-lift">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">
              UGCGen
            </span>
          </Link>

          {/* Navigation Links - Only show on homepage */}
          {isHomePage && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {/* Main Navigation Links - Always visible for authenticated users */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className={`transition-smooth hover-lift px-4 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/dashboard' 
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/generate" 
                className={`transition-smooth hover-lift px-4 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/generate' 
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Generator
              </Link>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {getDisplayName()}
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover-lift transition-smooth"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="hidden sm:inline-flex">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;