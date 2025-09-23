import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Wand2, Video, Image as ImageIcon, CheckCircle } from "lucide-react";
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabaseClient';

const UGCAvatar = () => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [prompt, setPrompt] = useState('');
  const [uploadedProduct, setUploadedProduct] = useState<string | null>(null);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isInitializingWorkflow, setIsInitializingWorkflow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatOptions = [
    { id: 'portrait', label: 'Portrait 9:16', icon: '📱' },
    { id: 'landscape', label: 'Landscape 16:9', icon: '🖥️' },
  ];

  // ---------- Step 1: Select Format + Init Workflow ----------
  const handleFormatSelect = async (format: string) => {
    console.log('Format selected:', format); // Add logging to verify the function is called
    setSelectedFormat(format);
    // Removed workflow initialization since webhook is now called directly from Generate AI Image
    toast({ title: "Format Selected", description: `Selected ${format}. Ready to generate content.` });
  };

  // ---------- Upload ----------
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setUploadedProduct(e.target?.result as string);
      reader.readAsDataURL(file);
      toast({ title: "Product uploaded", description: "Uploaded successfully." });
    }
  };

  // ---------- Step 2: Generate AI Image ----------
  const handleGenerateImage = async () => {
    if (!selectedFormat) {
      toast({ title: "Select Format", description: "Choose format first.", variant: "destructive" });
      return;
    }
    if (!uploadedProduct) {
      toast({ title: "Upload Required", description: "Upload a product image.", variant: "destructive" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Enter a prompt.", variant: "destructive" });
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Convert uploaded image to URL if it exists
      let imageUrl = null;
      if (uploadedProduct) {
        try {
          console.log('Starting image conversion process');
          
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
            } else if (result.imageUrl) {  // Add this condition to check for imageUrl
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

      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const payload: Record<string, unknown> = {
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat,
        input_image_url: imageUrl,
        status: "queued",
        action: "generate_image",
        // Include the user ID in the payload
        ...(userId && { user_id: userId }),
        timestamp: new Date().toISOString(),
      };

      // Call the Vercel API route for image generation
      const response = await fetch('/api/webhook-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*,application/octet-stream,application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setGeneratedPhoto(objectUrl);
        } else {
          const result = await response.json();
          const url = result.image_url || result.source_url || result.url;
          if (url) setGeneratedPhoto(url);
          else throw new Error("No image URL in response");
        }
        toast({ title: "Success!", description: "AI photo generated." });
      } else throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate photo.", variant: "destructive" });
      setGeneratedPhoto(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ---------- Regenerate AI Image ----------
  const handleRegenerateImage = async () => {
    if (!selectedFormat) {
      toast({ title: "Select Format", description: "Choose format first.", variant: "destructive" });
      return;
    }
    if (!uploadedProduct) {
      toast({ title: "Upload Required", description: "Upload a product image.", variant: "destructive" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Enter a prompt.", variant: "destructive" });
      return;
    }

    setIsRegeneratingImage(true);
    
    try {
      // Convert uploaded image to URL if it exists
      let imageUrl = null;
      if (uploadedProduct) {
        try {
          console.log('Starting image conversion process for regeneration');
          
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
            } else if (result.imageUrl) {  // Add this condition to check for imageUrl
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

      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Prepare payload for regeneration webhook
      const payload = {
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat,
        input_image_url: imageUrl,
        status: "queued",
        // Include the user ID in the payload
        ...(userId && { user_id: userId }),
        timestamp: new Date().toISOString(),
        action: "regenerate_image"
      };

      console.log('Sending regeneration payload to webhook:', payload);

      // Call the Vercel API route for regeneration
      const response = await fetch('/api/webhook-regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*,application/octet-stream,application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setGeneratedPhoto(objectUrl);
        } else {
          const result = await response.json();
          const url = result.image_url || result.source_url || result.url;
          if (url) setGeneratedPhoto(url);
          else throw new Error("No image URL in response");
        }
        toast({ title: "Success!", description: "AI photo regenerated." });
      } else throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to regenerate photo.", variant: "destructive" });
      setGeneratedPhoto(null);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  // ---------- Step 3: Generate Video ----------
  const handleGenerateVideo = async () => {
    if (!generatedPhoto) {
      toast({ title: "Generate Photo First", description: "Need a photo before video.", variant: "destructive" });
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const payload = {
        image_url: generatedPhoto,
        aspect_ratio: selectedFormat,
        prompt: prompt.trim(),
        action: "generate_video",
        timestamp: new Date().toISOString(),
      };

      // Call the Vercel API route for video generation
      const response = await fetch('/api/webhook-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const videoUrl =
          result.video_url ||
          result.source_url ||
          result.url ||
          (result.data?.response?.resultUrls?.[0] ?? null);

        if (videoUrl) {
          setGeneratedVideo(videoUrl);
          toast({ title: "Video Ready!", description: "UGC video generated." });
        } else throw new Error("No video URL found");
      } else throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate video.", variant: "destructive" });
      setGeneratedVideo(null);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // ---------- Download ----------
  const handleDownloadPhoto = () => {
    if (!generatedPhoto) return;
    const a = document.createElement('a');
    a.href = generatedPhoto;
    a.download = `ugc-avatar-${Date.now()}.png`;
    a.click();
  };

  const handleDownloadVideo = () => {
    if (!generatedVideo) return;
    const a = document.createElement('a');
    a.href = generatedVideo;
    a.download = `ugc-video-${Date.now()}.mp4`;
    a.click();
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center">UGC Avatar</h1>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Format</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {formatOptions.map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleFormatSelect(option.id)}
                      disabled={isInitializingWorkflow || (selectedFormat && selectedFormat !== option.id)}
                      variant={selectedFormat === option.id ? "default" : "outline"}
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span>{option.label}</span>
                      {selectedFormat === option.id && <CheckCircle className="ml-2 w-4 h-4" />}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Upload Product</CardTitle></CardHeader>
                <CardContent onClick={() => fileInputRef.current?.click()} className="cursor-pointer border p-4 rounded-lg">
                  {uploadedProduct ? <img src={uploadedProduct} className="h-32 object-cover mx-auto" /> :
                    <p className="text-gray-400">Click to upload</p>}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Prompt</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your UGC scene..." />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={handleGenerateImage} disabled={isGeneratingImage || isRegeneratingImage} className="flex-1">
                  {isGeneratingImage ? "Generating..." : "Generate AI Photo"}
                </Button>
                <Button 
                  onClick={handleRegenerateImage} 
                  disabled={!generatedPhoto || isGeneratingImage || isRegeneratingImage}
                  variant="outline"
                  className="flex-1"
                >
                  {isRegeneratingImage ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>
              <Button onClick={handleGenerateVideo} disabled={isGeneratingVideo || !generatedPhoto} className="w-full">
                {isGeneratingVideo ? "Creating Video..." : "Generate UGC Video"}
              </Button>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Your UGC Photo</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                  {generatedPhoto ? (
                    <div className="relative">
                      <img src={generatedPhoto} className="max-h-96 rounded-lg" />
                      <Button 
                        onClick={handleDownloadPhoto} 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : <p className="text-gray-400">No photo yet</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Your UGC Video</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                  {generatedVideo ? (
                    <div className="relative">
                      <video src={generatedVideo} controls className="min-h-80 rounded-lg" />
                      <Button 
                        onClick={handleDownloadVideo} 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : <p className="text-gray-400">No video yet</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UGCAvatar;