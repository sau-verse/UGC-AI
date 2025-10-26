import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Image, Video, Zap, BarChart3, Clock, TrendingUp, Download, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from '@/hooks/supabase/useAuth';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Define types for our project data
interface Project {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  prompt?: string;
  input_image?: string;
  generated_image_url?: string;
  generated_video_url?: string;
  created_at: string;
  credits_used?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);
  const [stats, setStats] = useState([
    {
      title: "Images Generated",
      value: "0",
      icon: Image,
      change: "+0% this month",
      changeType: "neutral"
    },
    {
      title: "Videos Created",
      value: "0",
      icon: Video,
      change: "+0% this month", 
      changeType: "neutral"
    },
    {
      title: "Credits Remaining",
      value: "100",
      icon: Zap,
      change: "Resets in 30 days",
      changeType: "neutral"
    },
    {
      title: "Total Projects",
      value: "0",
      icon: BarChart3,
      change: "+0 this week",
      changeType: "neutral"
    }
  ]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [lightboxProject, setLightboxProject] = useState<Project | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
            console.error('Error fetching user profile:', error);
          } else if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch all projects for the current user
  useEffect(() => {
    const fetchAllProjects = async () => {
      if (!user) {
        console.log('No user authenticated');
        setRecentProjects([]); // Clear projects when no user
        setAllProjects([]);
        setProjectsLoading(false);
        return;
      }
      
      console.log('Fetching projects for user:', user.id);
      setProjectsLoading(true);
      
      try {
        // Fetch all image jobs for the user with credits information
        const { data: imageJobs, error: imageJobsError } = await supabase
          .from('image_jobs')
          .select(`
            id, 
            prompt, 
            input_image_url, 
            image_gen_url, 
            status, 
            action,
            updated_at
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        console.log('Image jobs query result:', { data: imageJobs, error: imageJobsError, count: imageJobs?.length });
        
        if (imageJobsError) {
          console.error('Error fetching image jobs:', imageJobsError);
          setRecentProjects([]);
          setAllProjects([]);
          setProjectsLoading(false);
          return;
        }
        
        // Transform image jobs to project format
        const imageProjects: Project[] = (imageJobs || []).map(job => ({
          id: job.id,
          title: job.prompt ? job.prompt.substring(0, 30) + (job.prompt.length > 30 ? '...' : '') : 'Untitled Project',
          type: "Image",
          date: formatDateIST(new Date(job.updated_at)),
          status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status === 'failed' ? 'Failed' : job.status,
          prompt: job.prompt,
          input_image: job.input_image_url, // Using input_image_url from Supabase
          generated_image_url: job.image_gen_url,
          created_at: job.updated_at,
          credits_used: job.status === 'done' && job.action ? 5 : 0 // 5 credits for completed image jobs
        }));
        
        console.log('Transformed image projects:', imageProjects);
        
        // Fetch all video jobs for the user with credits information
        const { data: videoJobs, error: videoJobsError } = await supabase
          .from('video_jobs')
          .select(`
            video_job_id,
            image_job_id,
            generated_video_url, 
            status, 
            updated_at
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        console.log('Video jobs query result:', { data: videoJobs, error: videoJobsError, count: videoJobs?.length });
        
        if (videoJobsError) {
          console.error('Error fetching video jobs:', videoJobsError);
          setRecentProjects([]);
          setAllProjects([]);
          setProjectsLoading(false);
          return;
        }
        
        // Transform video jobs to project format
        const videoProjects: Project[] = (videoJobs || []).map(job => {
          // Find the related image job to get prompt and input image
          const relatedImageJob = (imageJobs || []).find(imgJob => imgJob.id === job.image_job_id);
          return {
            id: job.video_job_id,
            title: relatedImageJob?.prompt ? relatedImageJob.prompt.substring(0, 30) + (relatedImageJob.prompt.length > 30 ? '...' : '') : 'Untitled Project',
            type: "Video",
            date: formatDateIST(new Date(job.updated_at)),
            status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status === 'failed' ? 'Failed' : job.status,
            prompt: relatedImageJob?.prompt,
            input_image: relatedImageJob?.input_image_url, // Using input_image_url from related image job
            generated_video_url: job.generated_video_url,
            created_at: job.updated_at,
            credits_used: job.status === 'done' ? 50 : 0 // 50 credits for completed video jobs
          };
        });
        
        console.log('Transformed video projects:', videoProjects);
        
        // Combine and sort all projects by date (most recent first)
        const allProjectsCombined = [...imageProjects, ...videoProjects]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        console.log('Combined and sorted projects:', allProjectsCombined);
        console.log('Total projects count:', allProjectsCombined.length);
        
        // Set all projects and calculate pagination
        setAllProjects(allProjectsCombined);
        setTotalPages(Math.ceil(allProjectsCombined.length / itemsPerPage));
        
        // Set recent projects (first page)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allProjectsCombined.length);
        setRecentProjects(allProjectsCombined.slice(startIndex, endIndex));
      } catch (error) {
        console.error('Error fetching all projects:', error);
        setRecentProjects([]); // Clear projects on error
        setAllProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchAllProjects();
  }, [user, currentPage]); // Remove allProjects from dependencies to prevent frequent refreshes

  // Fetch dashboard statistics - only refresh when user changes
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch user's current credits
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        }
        
        // Fetch ALL image jobs for the user (not just 'done' ones)
        const { data: allImageJobs, error: imageJobsError } = await supabase
          .from('image_jobs')
          .select('status')
          .eq('user_id', user.id);
        
        // Count completed image jobs (status = 'done')
        const completedImageJobsCount = (allImageJobs || []).filter(job => job.status === 'done').length;
        
        // Fetch ALL video jobs for the user (not just 'done' ones)
        const { data: allVideoJobs, error: videoJobsError } = await supabase
          .from('video_jobs')
          .select('status')
          .eq('user_id', user.id);
        
        // Count completed video jobs (status = 'done')
        const completedVideoJobsCount = (allVideoJobs || []).filter(job => job.status === 'done').length;
        
        // Calculate total projects
        const totalProjects = completedImageJobsCount + completedVideoJobsCount;
        
        // Calculate credits used (5 per completed image job, 50 per completed video job)
        const creditsUsed = completedImageJobsCount * 5 + completedVideoJobsCount * 50;
        const creditsRemaining = profileData?.credits ?? 100;
        
        // Calculate weekly projects (jobs created in the last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Update stats with fetched data
        setStats(prevStats => [
          {
            ...prevStats[0],
            value: completedImageJobsCount.toString() || "0",
            change: `+${completedImageJobsCount} completed`
          },
          {
            ...prevStats[1],
            value: completedVideoJobsCount.toString() || "0",
            change: `+${completedVideoJobsCount} completed`
          },
          {
            ...prevStats[2],
            value: creditsRemaining.toString(),
            change: `${creditsUsed} credits used`
          },
          {
            ...prevStats[3],
            value: totalProjects.toString(),
            change: `+${totalProjects} total projects`
          }
        ]);
        
        if (imageJobsError) console.error('Error fetching image jobs:', imageJobsError);
        if (videoJobsError) console.error('Error fetching video jobs:', videoJobsError);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]); // Remove allProjects from dependencies to prevent frequent refreshes

  // Helper function to format date in IST
  const formatDateIST = (date: Date): string => {
    const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    return istDate.toLocaleString("en-IN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to generate page numbers for pagination
  const getPageNumbers = () => {
    const maxVisiblePages = 10;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a sliding window of pages
      const sidePages = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - sidePages);
      let endPage = Math.min(totalPages, currentPage + sidePages);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= sidePages) {
        endPage = maxVisiblePages;
      }
      if (currentPage > totalPages - sidePages) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis-start');
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add last page and ellipsis if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Functions for jumping 10 pages
  const goToPreviousSet = () => {
    const newPage = Math.max(1, currentPage - 10);
    setCurrentPage(newPage);
  };

  const goToNextSet = () => {
    const newPage = Math.min(totalPages, currentPage + 10);
    setCurrentPage(newPage);
  };

  useEffect(() => {
    // Update recentProjects when currentPage or allProjects change
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allProjects.length);
    setRecentProjects(allProjects.slice(startIndex, endIndex));
  }, [currentPage, allProjects]);

  // Get display name for the user
  const getDisplayName = () => {
    if (userProfile) {
      if (userProfile.first_name && userProfile.last_name) {
        return `${userProfile.first_name} ${userProfile.last_name}`;
      } else if (userProfile.first_name) {
        return userProfile.first_name;
      } else if (userProfile.last_name) {
        return userProfile.last_name;
      }
    }
    
    // Fallback to email if no name is available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Function to open lightbox with project details
  const openLightbox = (project: Project) => {
    setLightboxProject(project);
    setIsLightboxOpen(true);
    setLightboxImageUrl(null);
  };

  // Function to open lightbox with image URL
  const openImageLightbox = (imageUrl: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxProject(null);
    setIsLightboxOpen(true);
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxProject(null);
    setLightboxImageUrl(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Function to download media
  const downloadMedia = (url: string | undefined, filename: string) => {
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to render the lightbox portal
  const renderLightbox = () => {
    if (typeof document === "undefined") return null;

    return createPortal(
      <>
        {/* Image Lightbox */}
        <AnimatePresence>
          {isLightboxOpen && lightboxImageUrl && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <motion.div
                className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-white z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={lightboxImageUrl}
                  alt="Preview"
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadMedia(lightboxImageUrl, 'image.jpg');
                  }}
                  className="absolute bottom-4 right-4"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Details Lightbox */}
        <AnimatePresence>
          {isLightboxOpen && lightboxProject && !lightboxImageUrl && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <motion.div
                className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-background rounded-xl shadow-2xl p-6 m-4"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-white z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Input Image Preview */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg mb-3 text-center">Input Image</h3>
                    {lightboxProject.input_image ? (
                      <div className="relative group">
                        <Button
                          onClick={() => downloadMedia(lightboxProject.input_image, `input-${lightboxProject.id}.jpg`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <img
                          src={lightboxProject.input_image}
                          alt="Input"
                          className="w-full h-64 object-contain rounded-lg border"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">No input image</span>
                      </div>
                    )}
                  </div>

                  {/* AI Generated Image Preview */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg mb-3 text-center">AI Generated Image</h3>
                    {lightboxProject.generated_image_url ? (
                      <div className="relative group">
                        <Button
                          onClick={() => downloadMedia(lightboxProject.generated_image_url, `generated-${lightboxProject.id}.jpg`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <img
                          src={lightboxProject.generated_image_url}
                          alt="AI Generated"
                          className="w-full h-64 object-contain rounded-lg border"
                        />
                      </div>
                    ) : lightboxProject.type === 'Video' ? (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Not applicable</span>
                      </div>
                    ) : lightboxProject.status === 'Failed' ? (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Failed</span>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Not generated yet</span>
                      </div>
                    )}
                  </div>

                  {/* AI Generated Video Preview */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg mb-3 text-center">AI Generated Video</h3>
                    {lightboxProject.generated_video_url ? (
                      <div className="relative group">
                        <Button
                          onClick={() => downloadMedia(lightboxProject.generated_video_url, `video-${lightboxProject.id}.mp4`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <video
                          ref={videoRef}
                          src={lightboxProject.generated_video_url}
                          className="w-full h-64 object-contain rounded-lg border"
                          controls
                          muted
                        />
                      </div>
                    ) : lightboxProject.type === 'Image' ? (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Not applicable</span>
                      </div>
                    ) : lightboxProject.status === 'Failed' ? (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Failed</span>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Not generated yet</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-lg mb-3">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="font-medium">{lightboxProject.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge 
                        variant={lightboxProject.status === 'Completed' ? 'default' : lightboxProject.status === 'Failed' ? 'destructive' : 'secondary'}
                        className={lightboxProject.status === 'Completed' ? 'bg-success text-success-foreground' : ''}
                      >
                        {lightboxProject.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created At</p>
                      <p className="font-medium">{lightboxProject.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Credits Used</p>
                      <p className="font-medium">{lightboxProject.credits_used || 0} credits</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Prompt</p>
                      <p className="font-medium">{lightboxProject.prompt || 'No prompt available'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                Welcome back, {getDisplayName()} 👋
              </h1>
              <p className="text-xl text-muted-foreground">
                Ready to create some amazing UGC content?
              </p>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <Link to="/generate">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  <Plus className="mr-2 w-5 h-5" />
                  Create New UGC Video
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover-lift dark:shadow-none border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-accent dark:bg-gray-700 rounded-lg">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                      className={stat.changeType === 'positive' ? 'bg-success text-success-foreground' : ''}
                    >
                      {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* All Projects Table - Expanded to full width */}
            <div className="lg:col-span-3">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>All Projects</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{allProjects.length} total projects</Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          // Refresh both projects and stats
                          setProjectsLoading(true);
                          setLoading(true);
                          
                          try {
                            // Re-fetch projects
                            const { data: imageJobs, error: imageJobsError } = await supabase
                              .from('image_jobs')
                              .select(`
                                id, 
                                prompt, 
                                input_image_url, 
                                image_gen_url, 
                                status, 
                                action,
                                updated_at
                              `)
                              .eq('user_id', user?.id)
                              .order('updated_at', { ascending: false });
                            
                            const { data: videoJobs, error: videoJobsError } = await supabase
                              .from('video_jobs')
                              .select(`
                                video_job_id,
                                image_job_id,
                                generated_video_url, 
                                status, 
                                updated_at
                              `)
                              .eq('user_id', user?.id)
                              .order('updated_at', { ascending: false });
                            
                            if (!imageJobsError && !videoJobsError) {
                              // Transform and update projects
                              const imageProjects: Project[] = (imageJobs || []).map(job => ({
                                id: job.id,
                                title: job.prompt ? job.prompt.substring(0, 30) + (job.prompt.length > 30 ? '...' : '') : 'Untitled Project',
                                type: "Image",
                                date: formatDateIST(new Date(job.updated_at)),
                                status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status === 'failed' ? 'Failed' : job.status,
                                prompt: job.prompt,
                                input_image: job.input_image_url,
                                generated_image_url: job.image_gen_url,
                                created_at: job.updated_at,
                                credits_used: job.status === 'done' && job.action ? 5 : 0
                              }));
                              
                              const videoProjects: Project[] = (videoJobs || []).map(job => {
                                const relatedImageJob = (imageJobs || []).find(imgJob => imgJob.id === job.image_job_id);
                                return {
                                  id: job.video_job_id,
                                  title: relatedImageJob?.prompt ? relatedImageJob.prompt.substring(0, 30) + (relatedImageJob.prompt.length > 30 ? '...' : '') : 'Untitled Project',
                                  type: "Video",
                                  date: formatDateIST(new Date(job.updated_at)),
                                  status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status === 'failed' ? 'Failed' : job.status,
                                  prompt: relatedImageJob?.prompt,
                                  input_image: relatedImageJob?.input_image_url,
                                  generated_video_url: job.generated_video_url,
                                  created_at: job.updated_at,
                                  credits_used: job.status === 'done' ? 50 : 0
                                };
                              });
                              
                              const allProjectsCombined = [...imageProjects, ...videoProjects]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                              
                              setAllProjects(allProjectsCombined);
                              setTotalPages(Math.ceil(allProjectsCombined.length / itemsPerPage));
                              
                              const startIndex = (currentPage - 1) * itemsPerPage;
                              const endIndex = Math.min(startIndex + itemsPerPage, allProjectsCombined.length);
                              setRecentProjects(allProjectsCombined.slice(startIndex, endIndex));
                            }
                            
                            // Re-fetch stats
                            if (user) {
                              const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('credits')
                                .eq('id', user.id)
                                .single();
                              
                              const { data: allImageJobs } = await supabase
                                .from('image_jobs')
                                .select('status')
                                .eq('user_id', user.id);
                              
                              const { data: allVideoJobs } = await supabase
                                .from('video_jobs')
                                .select('status')
                                .eq('user_id', user.id);
                              
                              const completedImageJobsCount = (allImageJobs || []).filter(job => job.status === 'done').length;
                              const completedVideoJobsCount = (allVideoJobs || []).filter(job => job.status === 'done').length;
                              const totalProjects = completedImageJobsCount + completedVideoJobsCount;
                              const creditsUsed = completedImageJobsCount * 5 + completedVideoJobsCount * 50;
                              const creditsRemaining = profileData?.credits ?? 100;
                              
                              setStats(prevStats => [
                                {
                                  ...prevStats[0],
                                  value: completedImageJobsCount.toString() || "0",
                                  change: `+${completedImageJobsCount} completed`
                                },
                                {
                                  ...prevStats[1],
                                  value: completedVideoJobsCount.toString() || "0",
                                  change: `+${completedVideoJobsCount} completed`
                                },
                                {
                                  ...prevStats[2],
                                  value: creditsRemaining.toString(),
                                  change: `${creditsUsed} credits used`
                                },
                                {
                                  ...prevStats[3],
                                  value: totalProjects.toString(),
                                  change: `+${totalProjects} total projects`
                                }
                              ]);
                            }
                          } catch (error) {
                            console.error('Error refreshing data:', error);
                          } finally {
                            setProjectsLoading(false);
                            setLoading(false);
                          }
                        }}
                        className="text-xs"
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {projectsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prompt</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Credits Used</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Input Image</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">AI Image</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">AI Video</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProjects.length > 0 ? (
                            recentProjects.map((project) => (
                              <tr 
                                key={project.id} 
                                className="border-b hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
                                onClick={() => openLightbox(project)}
                              >
                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                  {project.date}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="font-medium text-foreground max-w-xs truncate" title={project.prompt}>
                                    {project.prompt}
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <Badge variant="secondary">
                                    {project.type}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2">
                                  <Badge 
                                    variant={project.status === 'Completed' ? 'default' : 'secondary'}
                                    className={project.status === 'Completed' ? 'bg-success text-success-foreground' : ''}
                                  >
                                    {project.status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                  {project.credits_used || 0} credits
                                </td>
                                <td className="py-3 px-2">
                                  {project.input_image ? (
                                    <img 
                                      src={project.input_image} 
                                      alt="Input" 
                                      className="w-16 h-16 object-cover rounded border"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openImageLightbox(project.input_image!);
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.svg'; // Fallback image
                                      }}
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-2">
                                  {project.type === 'Image' && project.generated_image_url ? (
                                    <img 
                                      src={project.generated_image_url} 
                                      alt="AI Generated" 
                                      className="w-16 h-16 object-cover rounded border"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openImageLightbox(project.generated_image_url!);
                                      }}
                                    />
                                  ) : project.type === 'Image' ? (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">Not generated</span>
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">N/A</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-2">
                                  {project.type === 'Video' && project.generated_video_url ? (
                                    <video 
                                      src={project.generated_video_url} 
                                      className="w-16 h-16 object-cover rounded border"
                                      muted
                                      loop
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLightbox(project);
                                      }}
                                    />
                                  ) : project.type === 'Video' ? (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">Not generated</span>
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">N/A</span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center gap-4">
                                  <div className="bg-muted p-4 rounded-full">
                                    <Image className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-foreground mb-1">No projects yet</h3>
                                    <p className="text-sm">Create your first project to see it appear here</p>
                                  </div>
                                  <Link to="/generate">
                                    <Button>Create New Project</Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {!projectsLoading && allProjects.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, allProjects.length)} of {allProjects.length} projects
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousSet}
                          disabled={currentPage <= 10}
                          className="hidden sm:flex"
                        >
                          &laquo;10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, index) => (
                            typeof page === 'number' ? (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ) : (
                              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextSet}
                          disabled={currentPage > totalPages - 10}
                          className="hidden sm:flex"
                        >
                          10&raquo;
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ... existing code ... */}
          </div>
        </div>
      </main>

      {/* Render the lightbox portal */}
      {renderLightbox()}
    </div>
  );
};

export default Dashboard;