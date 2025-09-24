import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface WorkHistoryTableProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
}

const WorkHistoryTable: React.FC<WorkHistoryTableProps> = ({ 
  projects, 
  loading, 
  onRefresh 
}) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle video playback
  const handleVideoPlay = (videoUrl: string, projectTitle: string) => {
    try {
      // Open video in a new tab for full playback
      window.open(videoUrl, '_blank');
      toast({
        title: "Video Opening",
        description: `Opening "${projectTitle}" in a new tab`,
      });
    } catch (error) {
      console.error('Error opening video:', error);
      toast({
        title: "Error",
        description: "Failed to open video. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle video download
  const handleVideoDownload = async (videoUrl: string, projectTitle: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading "${projectTitle}"`,
      });
    } catch (error) {
      console.error('Error downloading video:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download video. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate video thumbnail
  const getVideoThumbnail = (videoUrl: string): string => {
    // For now, we'll use a placeholder. In a real implementation, you might:
    // 1. Generate thumbnails server-side when videos are processed
    // 2. Use a video thumbnail service
    // 3. Extract the first frame client-side
    return videoUrl; // This will be handled by the video element's poster
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'default';
      case 'processing':
      case 'queued':
        return 'secondary';
      case 'failed':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status badge styling
  const getStatusStyling = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle>Work History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Work History</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {projects.length} total projects
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {projects.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Prompt
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Input Image
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Generated Image
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Generated Video
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="border-b hover:bg-muted/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {project.date}
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant={project.type === 'UGC Image' ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {project.type === 'UGC Image' ? (
                            <ImageIcon className="w-3 h-3" />
                          ) : (
                            <VideoIcon className="w-3 h-3" />
                          )}
                          {project.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div 
                          className="font-medium text-foreground max-w-xs truncate" 
                          title={project.prompt}
                        >
                          {project.prompt || 'No prompt'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {project.input_image ? (
                          <img 
                            src={project.input_image} 
                            alt="Input" 
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(project.input_image, '_blank')}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {project.generated_image_url ? (
                          <img 
                            src={project.generated_image_url} 
                            alt="Generated Image" 
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(project.generated_image_url, '_blank')}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Not generated</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {project.generated_video_url ? (
                          <div className="relative w-16 h-16 rounded border overflow-hidden group">
                            <video 
                              src={project.generated_video_url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
                                onClick={() => handleVideoPlay(project.generated_video_url!, project.title)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Not generated</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant={getStatusVariant(project.status)}
                          className={getStatusStyling(project.status)}
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          {project.generated_video_url && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleVideoPlay(project.generated_video_url!, project.title)}
                                title="Play Video"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleVideoDownload(project.generated_video_url!, project.title)}
                                title="Download Video"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {project.generated_image_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(project.generated_image_url, '_blank')}
                              title="View Image"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, projects.length)} of {projects.length} projects
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="bg-muted p-4 rounded-full">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">No projects yet</h3>
                  <p className="text-sm">Create your first project to see it appear here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkHistoryTable;
