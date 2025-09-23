import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Wand2, Video, Image as ImageIcon, LogIn, UserPlus, Mail, AlertCircle } from "lucide-react"
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/supabase/useAuth'
import { useCreateJob } from '@/hooks/supabase/useCreateJob'
import { useJobStatus } from '@/hooks/supabase/useJobStatus'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const Login = () => {
  const [selectedFormat, setSelectedFormat] = useState('')
  const [prompt, setPrompt] = useState('')
  const [uploadedProduct, setUploadedProduct] = useState<string | null>(null)
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [emailVerified, setEmailVerified] = useState(true)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const { user, loading: authLoading, error: authError, signUp, signIn, signInWithGoogle, signOut } = useAuth()
  const { jobId, loading: createJobLoading, error: createJobError, createJob, reset } = useCreateJob()
  const { job, loading: jobStatusLoading, error: jobStatusError, refetch } = useJobStatus(jobId)

  // Handle OAuth callback
  useEffect(() => {
    // Check if we have a session after OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const iss = urlParams.get('iss');
    
    // If we have OAuth parameters, we're in the callback phase
    if (code || iss) {
      setOauthLoading(true);
      // The auth state will be updated by the useAuth hook
      // We'll automatically redirect to the protected page when user is authenticated
    }
  }, []);

  // Redirect to protected page when user is authenticated after OAuth
  useEffect(() => {
    if (user && oauthLoading) {
      setOauthLoading(false);
      // Navigate to the protected version of this page
      navigate('/generate');
    }
    
    // If user is already authenticated and not in OAuth flow, redirect to protected page
    if (user && !oauthLoading) {
      // Check email confirmation
      setCheckingEmail(true);
      checkEmailConfirmation();
    }
  }, [user, oauthLoading, navigate]);

  // Check email confirmation status
  const checkEmailConfirmation = async () => {
    if (user && !user.email_confirmed_at) {
      try {
        const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (updatedUser?.email_confirmed_at) {
          setEmailVerified(true);
          // Email is confirmed, redirect to protected page
          navigate('/generate');
        } else {
          // Email not confirmed, show error and redirect to login
          toast({
            title: "Email Not Confirmed",
            description: "Please confirm your email address before accessing this page.",
            variant: "destructive"
          });
          await signOut();
        }
      } catch (error) {
        console.error('Error checking email confirmation:', error);
        toast({
          title: "Authentication Error",
          description: "There was an error verifying your account. Please try logging in again.",
          variant: "destructive"
        });
        await signOut();
      } finally {
        setCheckingEmail(false);
      }
    } else {
      // User is authenticated and email is confirmed (or using OAuth)
      setEmailVerified(true);
      setCheckingEmail(false);
      // Redirect to protected page
      navigate('/generate');
    }
  };

  // Update job status when it changes
  React.useEffect(() => {
    if (job) {
      if (job.status === 'done') {
        setGeneratedPhoto(job.generated_image_url || null)
        setGeneratedVideo(job.generated_video_url || null)
        toast({
          title: "Job Complete!",
          description: "Your AI content has been generated successfully."
        })
      } else if (job.status === 'failed') {
        toast({
          title: "Job Failed",
          description: "There was an error generating your content. Please try again.",
          variant: "destructive"
        })
      }
    }
  }, [job, toast])

  const formatOptions = [
    { id: 'portrait', label: 'Portrait 9:16', icon: '📱' },
    { id: 'landscape', label: 'Landscape 16:9', icon: '🖥️' },
  ]

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoginMode) {
      const result = await signIn(email, password)
      if (result.success) {
        // Check if user's email is confirmed
        if (result.user && !result.user.email_confirmed_at) {
          toast({
            title: "Email Not Confirmed",
            description: "Please confirm your email address before logging in.",
            variant: "destructive"
          })
          return
        }
        
        toast({
          title: "Login Successful",
          description: "You are now logged in."
        })
      } else {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive"
        })
      }
    } else {
      // Signup with first name and last name
      const result = await signUp(email, password, firstName, lastName)
      if (result.success) {
        toast({
          title: "Sign Up Successful",
          description: "Please check your email to confirm your account."
        })
        // Reset form fields
        setFirstName('')
        setLastName('')
        // Switch to login mode so user can login after confirming email
        setIsLoginMode(true)
      } else {
        toast({
          title: "Sign Up Failed",
          description: result.error,
          variant: "destructive"
        })
      }
    }
  }

  const handleSignInWithGoogle = async () => {
    setOauthLoading(true);
    const result = await signInWithGoogle()
    if (!result.success) {
      setOauthLoading(false);
      toast({
        title: "Google Sign In Failed",
        description: result.error,
        variant: "destructive"
      })
    }
    // Note: For OAuth, the user will be redirected to Google for authentication
    // The user state will be updated via the onAuthStateChange listener
  }

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedProduct(result)
        toast({
          title: "Product uploaded",
          description: "Your product image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedProduct(result)
        toast({
          title: "Product uploaded",
          description: "Your product image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateContent = async () => {
    console.log('handleGenerateContent called');
    
    // Log the current user state
    console.log('Current user state:', { user, authLoading, authError });
    
    if (!selectedFormat) {
      toast({
        title: "Select Format",
        description: "Please select a format first.",
        variant: "destructive",
      })
      return
    }

    if (!uploadedProduct) {
      toast({
        title: "Upload Required",
        description: "Please upload a product image first.",
        variant: "destructive",
      })
      return
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please provide a prompt for content generation.",
        variant: "destructive",
      })
      return
    }

    // Check if user is authenticated before proceeding
    if (!user) {
      console.error('No authenticated user found when trying to create job');
      toast({
        title: "Authentication Required",
        description: "Please log in to create a job.",
        variant: "destructive",
      })
      return;
    }

    console.log('User is authenticated:', user.id, user.email);
    
    // Convert uploaded image to URL if it exists
    let imageUrl = null;
    if (uploadedProduct) {
      try {
        console.log('Starting image conversion process for Supabase job');
        
        // Alternative method to convert data URL to Blob
        const dataURLToBlob = (dataurl: string) => {
          let arr = dataurl.split(',')
          let mime = arr[0].match(/:(.*?);/)![1]
          let bstr = atob(arr[1])
          let n = bstr.length
          let u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          return new Blob([u8arr], { type: mime })
        }
        
        const blob = dataURLToBlob(uploadedProduct);
        console.log('Converted data URL to Blob:', blob.type, blob.size);
        
        // Create FormData and send to converter
        const formData = new FormData();
        formData.append('imageFile', blob, 'uploaded_product.png');
        console.log('FormData prepared with imageFile field');
        
        // Send to the converter endpoint through proxy
        console.log('Sending request to /n8n_binary/n8n-to-url-converter.php');
        const converterResponse = await fetch('/n8n_binary/n8n-to-url-converter.php', {
          method: 'POST',
          body: formData
        });
        
        console.log('Converter response status:', converterResponse.status);
        if (converterResponse.ok) {
          const result = await converterResponse.json();
          console.log('Converter response data:', result);
          console.log('Result keys:', Object.keys(result));
          if (result.url) {
            imageUrl = result.url;
            console.log('Image successfully converted to URL:', result.url);
          } else if (result.imageUrl) {
            imageUrl = result.imageUrl;
            console.log('Image successfully converted to URL:', result.imageUrl);
          } else {
            // If conversion succeeded but no URL returned, fall back to data URL
            console.warn('Image conversion succeeded but no URL returned, falling back to data URL');
            console.warn('Full result:', result);
            imageUrl = uploadedProduct;
          }
        } else {
          // If conversion failed, fall back to data URL
          console.warn('Image conversion failed with status:', converterResponse.status);
          const errorText = await converterResponse.text();
          console.warn('Error response:', errorText);
          imageUrl = uploadedProduct;
        }
      } catch (error) {
        console.error('Error converting image to URL:', error);
        // If conversion failed, fall back to data URL
        imageUrl = uploadedProduct;
      }
    }

    // Create job with the converted image URL instead of base64 data
    console.log('Creating job with data:', {
      prompt: prompt.trim(),
      aspect_ratio: selectedFormat,
      input_image: imageUrl
    });
    
    const result = await createJob({
      prompt: prompt.trim(),
      aspect_ratio: selectedFormat as 'portrait' | 'landscape',
      input_image: imageUrl
    })

    console.log('Create job result:', result);

    if (result.error) {
      console.error('Job creation failed:', result.error);
      toast({
        title: "Job Creation Failed",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Job Created",
      description: "Your content is being generated. This may take a few minutes."
    })
  }

  const handleDownloadPhoto = () => {
    if (!generatedPhoto) return;
    const a = document.createElement('a');
    a.href = generatedPhoto;
    a.download = `ai-content-${Date.now()}.png`;
    a.click();
  };

  const handleDownloadVideo = async () => {
    if (!generatedVideo) return
    
    try {
      console.log('Starting video download for URL:', generatedVideo)
      
      // Check if it's an external URL (needs CORS handling)
      const isExternalUrl = generatedVideo.startsWith('http') && !generatedVideo.includes('localhost')
      
      if (isExternalUrl) {
        console.log('External video URL detected, fetching as blob...')
        
        // Fetch the video as blob to handle CORS issues
        const response = await fetch(generatedVideo, {
          method: 'GET',
          mode: 'cors',
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`)
        }
        
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        
        console.log('Video blob created, starting download...')
        
        // Create download link with blob URL
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = `ugc-video-${Date.now()}.mp4`
        document.body.appendChild(a)
        a.click()
        a.remove()
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      } else {
        console.log('Local video URL, direct download...')
        
        // Direct download for local URLs
        const a = document.createElement('a')
        a.href = generatedVideo
        a.download = `ugc-video-${Date.now()}.mp4`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      
      toast({
        title: "Download Started",
        description: "Your UGC video is being downloaded.",
      })
      
      console.log('Video download initiated successfully')
    } catch (error) {
      console.error('Video download failed:', error)
      toast({
        title: "Download Failed",
        description: `Unable to download the video: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  // Show OAuth loading state
  if (oauthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-foreground">Redirecting to Google for authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth
  if (authLoading || checkingEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If user is already authenticated and email is verified, redirect to protected page
  if (user && emailVerified) {
    // This is handled by the useEffect, but we'll add a safeguard here
    navigate('/generate');
    return null;
  }

  // Show login/signup form if user is not authenticated
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navigation />
      <div className="w-full max-w-md p-6">
        <Card className="bg-card border-border shadow-large rounded-2xl">
          <CardHeader>
            <CardTitle className="text-card-foreground text-2xl font-bold text-center">
              {isLoginMode ? 'Login to Content Generator' : 'Sign Up for Content Generator'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary rounded-xl"
                        required={!isLoginMode}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary rounded-xl"
                        required={!isLoginMode}
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary rounded-xl"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary rounded-xl"
                  required
                />
              </div>
              {authError && (
                <div className="text-destructive text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    {isLoginMode ? 'Logging in...' : 'Signing up...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLoginMode ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {isLoginMode ? 'Login' : 'Sign Up'}
                  </div>
                )}
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            {/* Google Sign In Button */}
            <Button
              onClick={handleSignInWithGoogle}
              disabled={authLoading || oauthLoading}
              variant="outline"
              className="w-full h-12 border-border text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {authLoading || oauthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
                  Signing in with Google...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </div>
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                }}
                className="text-primary hover:text-primary/80 text-sm transition-colors"
              >
                {isLoginMode 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Show main content when user is authenticated (this part is removed since we redirect authenticated users)
}

export default Login