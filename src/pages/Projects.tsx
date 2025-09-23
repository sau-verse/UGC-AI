import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Filter, Download, Eye, MoreHorizontal, Image, Video, Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const projects = [
    {
      id: 1,
      title: "Sneaker Lifestyle Campaign",
      type: "UGC Video",
      thumbnail: "/placeholder.svg",
      date: "2024-01-15",
      status: "Completed",
      downloads: 12
    },
    {
      id: 2,
      title: "Skincare Routine Morning",
      type: "Lifestyle Image",
      thumbnail: "/placeholder.svg", 
      date: "2024-01-14",
      status: "Completed",
      downloads: 8
    },
    {
      id: 3,
      title: "Coffee Product Showcase",
      type: "UGC Video",
      thumbnail: "/placeholder.svg",
      date: "2024-01-13",
      status: "Processing",
      downloads: 0
    },
    {
      id: 4,
      title: "Fashion Accessories",
      type: "Lifestyle Image",
      thumbnail: "/placeholder.svg",
      date: "2024-01-12",
      status: "Completed",
      downloads: 15
    },
    {
      id: 5,
      title: "Tech Gadget Demo",
      type: "UGC Video", 
      thumbnail: "/placeholder.svg",
      date: "2024-01-11",
      status: "Completed",
      downloads: 23
    },
    {
      id: 6,
      title: "Home Decor Styling",
      type: "Lifestyle Image",
      thumbnail: "/placeholder.svg",
      date: "2024-01-10",
      status: "Completed",
      downloads: 7
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || 
      (filterType === "videos" && project.type === "UGC Video") ||
      (filterType === "images" && project.type === "Lifestyle Image");
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
                Your Projects
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage and download your AI-generated content
              </p>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <Link to="/ugc-generator">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  <Plus className="mr-2 w-5 h-5" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 w-4 h-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="videos">UGC Videos</SelectItem>
                <SelectItem value="images">Lifestyle Images</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover-lift shadow-soft border-0 overflow-hidden">
                <div className="aspect-video bg-muted/50 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {project.type === "UGC Video" ? (
                      <Video className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <Image className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 ${
                      project.status === 'Completed' 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {project.status}
                  </Badge>

                  {/* Action Menu */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(project.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {project.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.downloads} downloads
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 w-3 h-3" />
View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        disabled={project.status !== 'Completed'}
                      >
                        <Download className="mr-1 w-3 h-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first AI-generated content project"
                }
              </p>
              {!searchQuery && filterType === "all" && (
                <Link to="/ugc-generator">
                  <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
                    <Plus className="mr-2 w-4 h-4" />
                    Create First Project
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;