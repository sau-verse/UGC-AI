import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Sparkles, Video, Check, Users, Zap, Camera } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useEffect, useState } from "react";

const Home = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
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

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  useEffect(() => {
    const handleVideoHover = (e) => {
      if (e.type === 'mouseenter') {
        e.target.muted = false;
      } else if (e.type === 'mouseleave') {
        e.target.muted = true;
      }
    };

    const videoElements = document.querySelectorAll('.video-container video');
    videoElements.forEach(video => {
      video.addEventListener('mouseenter', handleVideoHover);
      video.addEventListener('mouseleave', handleVideoHover);
    });

    return () => {
      videoElements.forEach(video => {
        video.removeEventListener('mouseenter', handleVideoHover);
        video.removeEventListener('mouseleave', handleVideoHover);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6">
        <div className="container mx-auto text-center">
          {/* UGC Gen Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
                  UGC Gen
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  AI Content Platform
                </p>
              </div>
            </div>
          </div>
          
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
            <Button variant="outline" size="lg" className="px-8 py-4" onClick={openLightbox}>
              <Video className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative w-full">
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

      {/* Scrolling Photo Gallery */}
      <section className="py-12 px-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Example Creations
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our AI can create for your products
            </p>
          </div>

          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll-left whitespace-nowrap">
              {/* Photo 1 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web1.png" 
                    alt="AI Generated Content 1" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 2 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web2.png" 
                    alt="AI Generated Content 2" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 3 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web3.png" 
                    alt="AI Generated Content 3" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 4 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web4.png" 
                    alt="AI Generated Content 4" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 5 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web5.png" 
                    alt="AI Generated Content 5" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 6 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web6.png" 
                    alt="AI Generated Content 6" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 7 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web7.png" 
                    alt="AI Generated Content 7" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 8 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web8.png" 
                    alt="AI Generated Content 8" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 9 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web9.png" 
                    alt="AI Generated Content 9" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 10 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web10.png" 
                    alt="AI Generated Content 10" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 11 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web11.png" 
                    alt="AI Generated Content 11" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 12 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web12.png" 
                    alt="AI Generated Content 12" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Duplicate set for seamless infinite loop */}
              {/* Photo 1 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web1.png" 
                    alt="AI Generated Content 1" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 2 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web2.png" 
                    alt="AI Generated Content 2" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 3 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web3.png" 
                    alt="AI Generated Content 3" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 4 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web4.png" 
                    alt="AI Generated Content 4" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 5 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web5.png" 
                    alt="AI Generated Content 5" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 6 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web6.png" 
                    alt="AI Generated Content 6" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 7 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web7.png" 
                    alt="AI Generated Content 7" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 8 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web8.png" 
                    alt="AI Generated Content 8" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 9 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web9.png" 
                    alt="AI Generated Content 9" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 10 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web10.png" 
                    alt="AI Generated Content 10" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 11 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web11.png" 
                    alt="AI Generated Content 11" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
              
              {/* Photo 12 */}
              <div className="mx-4 inline-block">
                <div className="rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <img 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/image-web12.png" 
                    alt="AI Generated Content 12" 
                    className="object-contain hover:scale-105 transition-transform duration-300 max-w-sm h-96"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-12 px-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Example Videos
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our AI can create for your products
            </p>
          </div>

          {/* Video Scrolling Container */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll-left whitespace-nowrap">
              {/* Video 1 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-1.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 2 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-2.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 3 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-3.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 4 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-4.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 5 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-5.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Duplicate set for seamless infinite loop */}
              {/* Video 1 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-1.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 2 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-2.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 3 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-3.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 4 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-4.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
              
              {/* Video 5 */}
              <div className="mx-4 inline-block">
                <div className="w-64 rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center video-container">
                  <video 
                    src="https://reclad.site/n8n_binary/n8n_binary_images/website/videos/video-5.mp4" 
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Flexible plans for all your content creation needs
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* ₹500 Package */}
              <Card className="hover-lift shadow-medium border-0">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-foreground mb-2">₹500</div>
                    <div className="text-muted-foreground">one-time purchase</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">100 AI Image Generations</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">OR 10 UGC Videos</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">High-quality outputs</span>
                    </li>
                    <li className="flex items-center justify-center mt-4">
                      <span className="text-sm text-muted-foreground italic">Videos: 8 sec at 720p resolution</span>
                    </li>
                  </ul>

                  <div className="text-xs text-muted-foreground mb-4 italic">
                    Rollover credits. Pay only for what you use.
                  </div>

                  <Link to="/login">
                    <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-glow">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* ₹1000 Package */}
              <Card className="hover-lift shadow-medium border-0 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge>POPULAR</Badge>
                </div>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-foreground mb-2">₹1000</div>
                    <div className="text-muted-foreground">one-time purchase</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">200 AI Image Generations</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">OR 20 UGC Videos</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span className="text-muted-foreground">High-quality outputs</span>
                    </li>
                    <li className="flex items-center justify-center mt-4">
                      <span className="text-sm text-muted-foreground italic">Videos: 8 sec at 720p resolution</span>
                    </li>
                  </ul>

                  <div className="text-xs text-muted-foreground mb-4 italic">
                    Rollover credits. Pay only for what you use.
                  </div>

                  <Link to="/login">
                    <Button className="w-full bg-gradient-primary hover:opacity-90 shadow-glow">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Credits don't expire after 30 days. Rollover credits. Pay only for what you use.
              </p>
            </div>
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
            <p>&copy; 2025 UGCGen. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closeLightbox}>
          <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
              onClick={closeLightbox}
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/k01XrLR4HlQ?autoplay=1"
                title="Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;