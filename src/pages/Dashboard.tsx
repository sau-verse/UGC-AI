import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Image, Video, Zap, BarChart3, Clock, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from '@/hooks/supabase/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
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

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch image jobs count with status 'done'
        const { count: imageJobsCount, error: imageJobsError } = await supabase
          .from('image_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'done');
        
        // Fetch video jobs count with status 'done'
        const { count: videoJobsCount, error: videoJobsError } = await supabase
          .from('video_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'done');
        
        // Calculate total projects
        const totalProjects = (imageJobsCount || 0) + (videoJobsCount || 0);
        
        // Update stats with fetched data
        setStats(prevStats => [
          {
            ...prevStats[0],
            value: imageJobsCount?.toString() || "0",
            change: `+${imageJobsCount || 0}% this month`
          },
          {
            ...prevStats[1],
            value: videoJobsCount?.toString() || "0",
            change: `+${videoJobsCount || 0}% this month`
          },
          {
            ...prevStats[2],
            value: "100" // Placeholder for credits
          },
          {
            ...prevStats[3],
            value: totalProjects.toString(),
            change: `+${totalProjects} this week`
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
  }, [user]);

  // Fetch all projects for the current user
  useEffect(() => {
    const fetchAllProjects = async () => {
      if (!user) {
        console.log('No user authenticated');
        setRecentProjects([]); // Clear projects when no user
        setProjectsLoading(false);
        return;
      }
      
      console.log('Fetching projects for user:', user.id);
      setProjectsLoading(true);
      
      try {
        // Fetch all image jobs for the user
        const { data: imageJobs, error: imageJobsError } = await supabase
          .from('image_jobs')
          .select('id, prompt, input_image, generated_image_url, status, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        console.log('Image jobs query result:', { data: imageJobs, error: imageJobsError });
        
        if (imageJobsError) {
          console.error('Error fetching image jobs:', imageJobsError);
          setProjectsLoading(false);
          return;
        }
        
        // Transform image jobs to project format
        const imageProjects: Project[] = imageJobs.map(job => ({
          id: job.id,
          title: job.prompt ? job.prompt.substring(0, 30) + (job.prompt.length > 30 ? '...' : '') : 'Untitled Project',
          type: "UGC Image",
          date: getTimeAgo(new Date(job.updated_at)),
          status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status,
          prompt: job.prompt,
          input_image: job.input_image,
          generated_image_url: job.generated_image_url,
          created_at: job.updated_at
        }));
        
        console.log('Transformed image projects:', imageProjects);
        
        // Fetch all video jobs for the user
        const { data: videoJobs, error: videoJobsError } = await supabase
          .from('video_jobs')
          .select('video_job_id, prompt, image_gen_url, generated_video_url, status, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        console.log('Video jobs query result:', { data: videoJobs, error: videoJobsError });
        
        if (videoJobsError) {
          console.error('Error fetching video jobs:', videoJobsError);
          setProjectsLoading(false);
          return;
        }
        
        // Transform video jobs to project format
        const videoProjects: Project[] = videoJobs.map(job => ({
          id: job.video_job_id,
          title: job.prompt ? job.prompt.substring(0, 30) + (job.prompt.length > 30 ? '...' : '') : 'Untitled Project',
          type: "UGC Video",
          date: getTimeAgo(new Date(job.updated_at)),
          status: job.status === 'done' ? 'Completed' : job.status === 'processing' ? 'Processing' : job.status,
          prompt: job.prompt,
          input_image: job.image_gen_url,
          generated_video_url: job.generated_video_url,
          created_at: job.updated_at
        }));
        
        console.log('Transformed video projects:', videoProjects);
        
        // Combine and sort all projects by date (most recent first)
        const allProjects = [...imageProjects, ...videoProjects]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        console.log('Combined and sorted projects:', allProjects);
        console.log('Total projects count:', allProjects.length);
        
        setRecentProjects(allProjects);
      } catch (error) {
        console.error('Error fetching all projects:', error);
        setRecentProjects([]); // Clear projects on error
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchAllProjects();
  }, [user]);

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minutes ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }
  };

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
            {/* All Projects Table */}
            <div className="lg:col-span-2">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>All Projects</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{recentProjects.length} projects</Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.reload()}
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
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Input Image</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">AI Image</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">AI Video</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProjects.length > 0 ? (
                            recentProjects.map((project) => (
                              <tr key={project.id} className="border-b hover:bg-muted/50 dark:hover:bg-gray-800/50">
                                <td className="py-3 px-2 text-sm text-muted-foreground">
                                  {project.date}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="font-medium text-foreground max-w-xs truncate" title={project.prompt}>
                                    {project.prompt}
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  {project.input_image ? (
                                    <img 
                                      src={project.input_image} 
                                      alt="Input" 
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-2">
                                  {project.type === 'UGC Image' && project.generated_image_url ? (
                                    <img 
                                      src={project.generated_image_url} 
                                      alt="AI Generated" 
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  ) : project.type === 'UGC Image' ? (
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
                                  {project.type === 'UGC Video' && project.generated_video_url ? (
                                    <video 
                                      src={project.generated_video_url} 
                                      className="w-16 h-16 object-cover rounded border"
                                      muted
                                      loop
                                    />
                                  ) : project.type === 'UGC Video' ? (
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
                              <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="dark:shadow-none border-0">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/generate">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 w-4 h-4" />
                      New UGC Video
                    </Button>
                  </Link>
                  
                  <Link to="/projects">
                    <Button variant="outline" className="w-full justify-start">
                      <Image className="mr-2 w-4 h-4" />
                      Browse Projects
                    </Button>
                  </Link>
                  
                  <Link to="/settings">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 w-4 h-4" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Usage Overview */}
              <Card className="dark:shadow-none border-0 mt-6">
                <CardHeader>
                  <CardTitle>This Month's Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>AI Images</span>
                        <span className="text-muted-foreground">47/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full transition-smooth" style={{width: '47%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>UGC Videos</span>
                        <span className="text-muted-foreground">23/50</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full transition-smooth" style={{width: '46%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;