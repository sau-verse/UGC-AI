import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Sparkles, Video, Check, Users, Zap, Camera } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Home = () => {
  const features = [
    {
      icon: Upload,
      title: "Simple Upload",
      description: "Just drag and drop your product photos - no technical skills needed"
    },
    {
      icon: Sparkles,
      title: "AI Magic",
      description: "Our AI transforms your products into stunning lifestyle imagery"
    },
    {
      icon: Video,
      title: "UGC Videos",
      description: "Generate authentic user-generated content videos in seconds"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Product Photo",
      description: "Drop your product image and add a brief description"
    },
    {
      step: "02", 
      title: "Generate AI Lifestyle Image",
      description: "Our AI creates realistic lifestyle scenes with your product"
    },
    {
      step: "03",
      title: "Create UGC Video",
      description: "Transform the image into an engaging video for social media"
    }
  ];

  const pricingFeatures = [
    "100 AI images per month",
    "50 UGC videos per month", 
    "4K resolution downloads",
    "Priority processing",
    "Commercial license"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered UGC Generation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-6 leading-tight">
            Turn Product Photos into
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              UGC Videos with AI
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload. Generate. Publish. Create authentic user-generated content 
            videos from your product photos in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow px-8 py-4">
                Try Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4">
              <Video className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <img 
              src={heroBanner} 
              alt="AI UGC Platform Hero" 
              className="rounded-2xl shadow-large hover-lift w-full h-auto"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your product photos into engaging UGC content in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <Card key={index} className="text-center hover-lift shadow-soft border-0">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional UGC content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift shadow-soft border-0">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start free, upgrade when you need more
            </p>

            <Card className="hover-lift shadow-medium border-0">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-5xl font-bold text-foreground mb-2">$29</div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-glow">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-heading font-bold">UGCGen</span>
              </div>
              <p className="text-muted-foreground">
                Create authentic UGC content with AI
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 UGCGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;