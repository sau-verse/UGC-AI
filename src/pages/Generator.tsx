import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Wand2, Video, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react"
import Navigation from '@/components/Navigation'
import Lightbox from '@/components/Lightbox'
import { useCreateJob } from '@/hooks/supabase/useCreateJob'
import { useCreateVideoJob } from '@/hooks/supabase/useCreateVideoJob'
import { useUpdateJob } from '@/hooks/supabase/useUpdateJob'
import { useUpdateVideoJob } from '@/hooks/supabase/useUpdateVideoJob'
import { useVideoJobStatusRealtimeFixed as useVideoJobStatusRealtime } from '@/hooks/supabase/useVideoJobStatusRealtimeFixed'
import { useImageJobStatusRealtime } from '@/hooks/supabase/useImageJobStatusRealtime'
import { supabase } from '@/lib/supabaseClient'

const Generator = () => {
  const [selectedFormat, setSelectedFormat] = useState('')
  const [prompt, setPrompt] = useState('')
  const [uploadedProduct, setUploadedProduct] = useState<string | null>(null)
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [isInitializingWorkflow, setIsInitializingWorkflow] = useState(false)
  const [imageJobId, setImageJobId] = useState<string | null>(null)
  const [videoJobId, setVideoJobId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { createJob } = useCreateJob()
  const { createVideoJob } = useCreateVideoJob()
  const { updateJob } = useUpdateJob()
  const { updateVideoJob } = useUpdateVideoJob()
  const { job: videoJobStatus, loading: videoJobLoading } = useVideoJobStatusRealtime(videoJobId)
  const { job: imageJobStatus } = useImageJobStatusRealtime(imageJobId)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const shownToastsRef = useRef<Set<string>>(new Set());
  const isRegeneratingRef = useRef(false);

  // Fake progress states
  const [fakeProgressStage, setFakeProgressStage] = useState<'preparing' | 'generating' | 'finalizing' | 'waiting' | null>(null);
  const [fakeProgressTimer, setFakeProgressTimer] = useState<NodeJS.Timeout | null>(null);

  // Effect to manage fake progress for video generation
  useEffect(() => {
    let timer1: NodeJS.Timeout, timer2: NodeJS.Timeout, timer3: NodeJS.Timeout;

    // Only start fake progress when video job is queued
    if (videoJobStatus?.status === 'queued') {
      // Start with "Preparing input..." for 30 seconds (updated from 5 seconds)
      setFakeProgressStage('preparing');
      
      timer1 = setTimeout(() => {
        // Move to "Generating scenes..." for 1 minute
        setFakeProgressStage('generating');
        
        timer2 = setTimeout(() => {
          // Move to "Finalizing video..." for 1 minute
          setFakeProgressStage('finalizing');
          
          timer3 = setTimeout(() => {
            // After ~2.5 minutes, show fallback message
            setFakeProgressStage('waiting');
          }, 60000); // 1 minute for "Finalizing video..."
        }, 60000); // 1 minute for "Generating scenes..."
      }, 30000); // 30 seconds for "Preparing input..." (updated from 5 seconds)
    } else if (videoJobStatus?.status === 'processing' || videoJobStatus?.status === 'done' || videoJobStatus?.status === 'failed') {
      // Clear fake progress when actual status changes
      setFakeProgressStage(null);
    }

    // Cleanup function
    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
    };
  }, [videoJobStatus?.status]);

  // Watch image job realtime updates and reflect generated image
  useEffect(() => {
    console.log('Image job status effect triggered:', imageJobStatus?.status, 'isRegeneratingRef:', isRegeneratingRef.current)
    
    if (imageJobStatus?.status === 'done') {
      const url = imageJobStatus.generated_image_url || imageJobStatus.image_gen_url
      if (url) {
        setGeneratedPhoto(url)
        setIsImageLoading(false)
        setIsGeneratingImage(false)
        setIsRegeneratingImage(false)
        
        // Show success toast for regeneration (3 seconds duration)
        if (isRegeneratingRef.current) {
          toast({
            title: "Image regenerated successfully!",
            description: "Your new AI image is ready.",
            duration: 3000, // 3 seconds
          })
        } else {
          // Show success toast for initial generation
          toast({
            title: "Image generated successfully!",
            description: "Your AI image is ready.",
            duration: 3000, // 3 seconds
          })
        }
        
        isRegeneratingRef.current = false
      }
    } else if (imageJobStatus?.status === 'failed') {
      // Show error toast for regeneration failure
      if (isRegeneratingRef.current) {
        toast({
          title: "Regeneration failed",
          description: "Failed to regenerate image. Please try again.",
          variant: "destructive",
          duration: 5000, // 5 seconds
        })
      }
      
      // Stop loading states if image generation failed
      setIsImageLoading(false)
      setIsGeneratingImage(false)
      setIsRegeneratingImage(false)
      isRegeneratingRef.current = false
    } else if (imageJobStatus?.status === 'processing') {
      // Show processing toast for regeneration
      if (isRegeneratingRef.current) {
        toast({
          title: "Processing regeneration...",
          description: "Your image is being processed.",
          duration: 2000, // 2 seconds
        })
      }
    }
  }, [imageJobStatus, toast]) // Removed isRegeneratingImage and isGeneratingImage from dependencies

  const formatOptions = [
    { id: 'portrait', label: 'Portrait 9:16', icon: '📱' },
    { id: 'landscape', label: 'Landscape 16:9', icon: '🖥️' },
  ]

  // Wrapper function to add debugging for setGeneratedVideo
  const setGeneratedVideoWithDebug = (videoUrl: string | null) => {
    console.log('Setting generatedVideo state:', videoUrl);
    console.log('Previous generatedVideo state:', generatedVideo);
    setGeneratedVideo(videoUrl);
    // Add a small delay to ensure state is updated before logging
    setTimeout(() => {
      console.log('New generatedVideo state after update:', videoUrl);
    }, 0);
  };

  // ---------- Step 1: Select Format + Init Workflow ----------
  const handleFormatSelect = async (format: string) => {
    console.log('Format selected:', format)
    setSelectedFormat(format)
    // Removed workflow initialization since webhook is now called directly from Generate AI Image
    toast({
      title: "Format Selected",
      description: `Selected ${format}. Ready to generate content.`,
    })
  }

  // ---------- Upload ----------
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

  // ---------- Step 2: Generate AI Image ----------
  const handleGenerateImage = async () => {
    if (!selectedFormat) {
      toast({ title: "Select Format", description: "Choose format first.", variant: "destructive" })
      return
    }
    if (!uploadedProduct) {
      toast({ title: "Upload Required", description: "Upload a product image.", variant: "destructive" })
      return
    }
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Enter a prompt.", variant: "destructive" })
      return
    }

    setIsGeneratingImage(true)
    setIsImageLoading(true)
    toast({
      title: "Generating image...",
      description: "We're creating your AI image. This may take 30 to 45 sec.",
      duration: 30000, // 30 seconds
    })
    
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

      // Create DB row first to get a stable imageJobId
      const created = await createJob({
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat as 'portrait' | 'landscape',
        input_image: imageUrl || uploadedProduct || undefined
      })
      if (created.error || !created.jobId) throw new Error(created.error || 'Failed to create image job')
      setImageJobId(created.jobId)

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      const payload: Record<string, unknown> = {
        id: created.jobId,
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat,
        input_image_url: imageUrl,
        status: "queued",
        action: "generate_image",
        timestamp: new Date().toISOString(),
        ...(userId && { user_id: userId })
      }

      console.log('Sending payload to webhook:', payload);
      
      // Fire-and-forget webhook call - don't wait for response since realtime updates handle results
      fetch('/api/webhook-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'image/*,application/octet-stream,application/json' },
        body: JSON.stringify(payload),
      }).catch(error => {
        // Only log network errors, don't throw since realtime updates will handle the result
        console.warn('Webhook call failed (this is expected for long-running processes):', error);
      });
      
      console.log('Generate webhook sent successfully, waiting for realtime update')
    } catch (err) {
      console.error('Webhook error:', err);
      toast({ title: "Error", description: "Failed to generate photo.", variant: "destructive" })
      setGeneratedPhoto(null)
      setIsGeneratingImage(false)
      setIsImageLoading(false)
    }
  }

  // ---------- Regenerate AI Image ----------
  const handleRegenerateImage = async () => {
    if (!selectedFormat) {
      toast({ title: "Select Format", description: "Choose format first.", variant: "destructive" })
      return
    }
    if (!uploadedProduct) {
      toast({ title: "Upload Required", description: "Upload a product image.", variant: "destructive" })
      return
    }
    if (!prompt.trim()) {
      toast({ title: "Prompt Required", description: "Enter a prompt.", variant: "destructive" })
      return
    }
    if (!imageJobId) {
      toast({ title: "No Image to Regenerate", description: "Please generate an image first.", variant: "destructive" })
      return
    }

    // Set regeneration state immediately to show animation
    console.log('Setting regeneration states: isRegeneratingImage=true, isImageLoading=true')
    isRegeneratingRef.current = true
    setIsRegeneratingImage(true)
    setIsImageLoading(true) // Also set image loading to show the overlay
    
    toast({
      title: "Regenerating image...",
      description: "We're creating your AI image. This may take 30 to 45 sec.",
      duration: 30000, // 30 seconds
    })
    
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

      // Store the original image job ID before creating a new one
      const originalImageJobId = imageJobId;

      // Create a new DB row for regeneration (like generate flow)
      const created = await createJob({
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat as 'portrait' | 'landscape',
        input_image: imageUrl || uploadedProduct || undefined
      })
      if (created.error || !created.jobId) throw new Error(created.error || 'Failed to create image job for regeneration')
      setImageJobId(created.jobId)

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Prepare payload for regeneration webhook
      const payload = {
        id: created.jobId,
        prompt: prompt.trim(),
        aspect_ratio: selectedFormat,
        input_image_url: imageUrl,
        status: "queued",
        // Include the original image job ID that is being regenerated
        original_image_job_id: originalImageJobId,
        // Include the user ID in the payload
        ...(userId && { user_id: userId }),
        timestamp: new Date().toISOString(),
        action: "regenerate_image"
      };

      console.log('Sending regeneration payload to webhook:', payload);

      // Fire-and-forget webhook call - don't wait for response since realtime updates handle results
      fetch('/api/webhook-regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/*,application/octet-stream,application/json',
        },
        body: JSON.stringify(payload),
      }).catch(error => {
        // Only log network errors, don't throw since realtime updates will handle the result
        console.warn('Regeneration webhook call failed (this is expected for long-running processes):', error);
      });

      console.log('Regeneration webhook sent successfully, waiting for realtime update')
    } catch (err) {
      toast({ title: "Error", description: "Failed to regenerate photo.", variant: "destructive" })
      setIsRegeneratingImage(false)
      setIsImageLoading(false) // Reset image loading state on error
      isRegeneratingRef.current = false
    }
  }

  // ---------- Step 3: Generate Video ----------
  const handleGenerateVideo = async () => {
    if (!generatedPhoto) {
      toast({ title: "Generate Photo First", description: "Need a photo before video.", variant: "destructive" });
      return;
    }
    // Removed resumeUrl check since we're moving to webhooks entirely for reliability

    setIsGeneratingVideo(true);
    setVideoJobId(null); // Reset video job ID
    let jobResult: { jobId?: string; error?: string } | null = null;
    
    try {
      // Create job in Supabase with only image_job_id (status defaults to 'queued')
      console.log('Creating video job in Supabase with image_job_id:', imageJobId);
      
      // Validate that we have a valid imageJobId
      if (!imageJobId) {
        toast({
          title: "Image Job Missing",
          description: "No image job found. Please generate an image first.",
          variant: "destructive",
        });
        return;
      }
      
      jobResult = await createVideoJob({
        image_job_id: imageJobId // Only pass the required image_job_id
        // status defaults to 'queued' in the database
        // created_at defaults to current timestamp in the database
      });

      if (jobResult.error) {
        console.error('Video job creation failed:', jobResult.error);
        toast({
          title: "Job Creation Failed",
          description: jobResult.error,
          variant: "destructive",
        });
        return;
      } else {
        console.log('Video job created successfully with ID:', jobResult.jobId);
        setVideoJobId(jobResult.jobId || null); // Set the video job ID to listen for updates
        console.log('Video job ID set in state:', jobResult.jobId);
        toast({
          title: "Job Created",
          description: "Your video generation job has been recorded and is queued.",
        });
      }

      // The webhook is now triggered automatically by Supabase when the row is created
      // No need to manually trigger it from the frontend
      console.log('Video job created, Supabase will trigger the webhook automatically');
      
      toast({ 
        title: "Video Generation Started", 
        description: "Your video is being generated. Check back later for the result." 
      });
    } catch (err) {
      // Update job status to failed if job was created
      if (jobResult && jobResult.jobId) {
        console.log('Updating job status to failed due to error');
        await updateVideoJob({
          jobId: jobResult.jobId,
          status: 'failed'
        });
      }
      
      toast({ 
        title: "Error", 
        description: "Failed to start video generation. Please try again.", 
        variant: "destructive" 
      });
      setGeneratedVideo(null);
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  // Effect to handle video job status updates
  useEffect(() => {
    console.log('Video job status useEffect triggered with:', videoJobStatus);
    if (videoJobStatus) {
      console.log('Video job status updated:', videoJobStatus);
      console.log('Video job status keys:', Object.keys(videoJobStatus));
      
      // Log all values in the video job status
      Object.keys(videoJobStatus).forEach(key => {
        console.log(`Video job field ${key}:`, videoJobStatus[key]);
      });
      
      // Check if this update contains the generated_video_url
      if (videoJobStatus.generated_video_url) {
        console.log('🎉 Found generated_video_url in update:', videoJobStatus.generated_video_url);
        console.log('🎉 Setting generated video state to:', videoJobStatus.generated_video_url);
        setGeneratedVideoWithDebug(videoJobStatus.generated_video_url);
      } else {
        console.log('No generated_video_url found in update. Current value:', videoJobStatus.generated_video_url);
      }
      
      // Check if this update changes the status to 'done'
      if (videoJobStatus.status === 'done') {
        console.log('🎉 Status changed to done');
        console.log('🎉 Generated video URL should be available:', videoJobStatus.generated_video_url);
        if (videoJobStatus.generated_video_url) {
          console.log('🎉 Setting generated video from done status:', videoJobStatus.generated_video_url);
          setGeneratedVideoWithDebug(videoJobStatus.generated_video_url);
        }
      } else {
        console.log('Status is not done:', videoJobStatus.status);
      }
      
      // Handle different statuses
      switch (videoJobStatus.status) {
        case 'done':
          // Handle array responses by extracting first element if needed
          let normalizedResponse = videoJobStatus;
          if (Array.isArray(videoJobStatus) && videoJobStatus.length > 0) {
            normalizedResponse = videoJobStatus[0];
          }
          
          // Create a unique identifier for this job
          const jobId = normalizedResponse.video_job_id || normalizedResponse.id || JSON.stringify(normalizedResponse);
          
          // Log the entire response for debugging
          console.log('Video job marked as done. Full response:', normalizedResponse);
          console.log('All properties in response:', Object.keys(normalizedResponse));
          
          // Extract video URL - use specific field name without aliases
          let videoUrl = normalizedResponse.generated_video_url;
          console.log('Checked generated_video_url field:', videoUrl);
            
          if (videoUrl) {
            console.log('Found video URL:', videoUrl);
            setGeneratedVideoWithDebug(videoUrl);
            // Only show toast if it hasn't been shown already for this job
            if (!shownToastsRef.current.has(jobId)) {
              shownToastsRef.current.add(jobId);
              toast({
                title: "Video Generation Complete",
                description: "Your video has been successfully generated.",
                duration: 2000, // 2 seconds
              });
            }
          } else {
            // Log all available keys for debugging
            console.warn('Video job marked as done but no video URL found:', normalizedResponse);
            console.warn('Available keys in response:', Object.keys(normalizedResponse));
            // Only show toast if it hasn't been shown already for this job
            if (!shownToastsRef.current.has(jobId)) {
              shownToastsRef.current.add(jobId);
              toast({
                title: "Video Generation Complete",
                description: "Video job completed but no video URL was found.",
                variant: "destructive",
                duration: 2000, // 2 seconds
              });
            }
          }
          break;
          
        case 'failed':
          // Handle array responses for error messages
          let normalizedErrorResponse = videoJobStatus;
          if (Array.isArray(videoJobStatus) && videoJobStatus.length > 0) {
            normalizedErrorResponse = videoJobStatus[0];
          }
          
          // Create a unique identifier for this job
          const errorJobId = normalizedErrorResponse.video_job_id || normalizedErrorResponse.id || JSON.stringify(normalizedErrorResponse);
          
          // Only show toast if it hasn't been shown already for this job
          if (!shownToastsRef.current.has(errorJobId)) {
            shownToastsRef.current.add(errorJobId);
            toast({
              title: "Video Generation Failed",
              description: normalizedErrorResponse.error_message || normalizedErrorResponse.error || "Video generation failed. Please try again.",
              variant: "destructive",
              duration: 600000, // 10 minutes (600,000 ms)
            });
          }
          break;
          
        case 'processing':
          // Could show a processing message or progress indicator
          break;
          
        case 'queued':
          // Could show a queued message
          break;
      }
    }
  }, [videoJobStatus, toast]);

  // Clear the shown toasts ref when the component unmounts or videoJobId changes
  useEffect(() => {
    return () => {
      shownToastsRef.current.clear();
    };
  }, [videoJobId]);

  // ---------- Download ----------
  const handleDownloadPhoto = async () => {
    if (!generatedPhoto) return;
    
    try {
      // For remote URLs, we need to fetch the image first and then create a blob
      if (generatedPhoto.startsWith('http')) {
        // Fetch the image with proper headers to avoid CORS issues
        const response = await fetch(generatedPhoto, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-content-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // For local URLs (blob URLs), we can download directly
        const a = document.createElement('a');
        a.href = generatedPhoto;
        a.download = `ai-content-${Date.now()}.png`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({ 
        title: "Download Failed", 
        description: "Failed to download the image. Please try again.",
        variant: "destructive" 
      });
    }
  };

  const handleDownloadVideo = async () => {
    if (!generatedVideo) return;
    
    try {
      // For remote URLs, we need to fetch the video first and then create a blob
      if (generatedVideo.startsWith('http')) {
        const response = await fetch(generatedVideo);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-content-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // For local URLs (blob URLs), we can download directly
        const a = document.createElement('a');
        a.href = generatedVideo;
        a.download = `ai-content-${Date.now()}.mp4`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      toast({ 
        title: "Download Failed", 
        description: "Failed to download the video. Please try again.",
        variant: "destructive" 
      });
    }
  };

  // Function to open lightbox
  const openLightbox = () => {
    if (generatedPhoto) {
      setIsLightboxOpen(true);
    }
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Function to handle clicks outside the image in lightbox
  const handleLightboxBackdropClick = (e: React.MouseEvent) => {
    // Close lightbox when clicking on the backdrop (not on the image)
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  };

  // Close lightbox with Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isLightboxOpen]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLightboxOpen]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <main className="pt-24 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Content Generator</h1>
              <p className="text-muted-foreground">Create personalized avatar content with AI</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Sidebar - Controls */}
            <div className="space-y-6">
              {/* Image Section */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-primary" />
                    Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Choose Format */}
                  <div>
                    <div className="flex items-center justify-between gap-5 mb-3">
                      <h3 className="text-foreground font-medium">Choose format</h3>
                      <div className="flex gap-2">
                        {formatOptions.map((option) => (
                          <Button
                            key={option.id}
                            variant={selectedFormat === option.id ? "default" : "outline"}
                            className="transition-smooth hover-lift"
                            onClick={() => handleFormatSelect(option.id)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upload Product */}
                  <div>
                    <h3 className="text-foreground font-medium mb-3">
                      Upload Product <span className="text-destructive">(Required)</span>
                    </h3>
                    <Card 
                      className="relative border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary transition-smooth cursor-pointer bg-muted/50 hover-lift"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedProduct ? (
                        <div className="space-y-3">
                          <img
                            src={uploadedProduct}
                            alt="Uploaded product"
                            className="w-full object-contain rounded-lg mx-auto"
                            style={{ height: '240px' }}
                          />
                          <p className="text-sm text-success font-medium">Product uploaded!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">Drag & drop your product</p>
                            <p className="text-muted-foreground text-sm">or click to browse</p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </Card>
                  </div>

                  {/* Prompt */}
                  <div>
                    <h3 className="text-foreground font-medium mb-3">Prompt</h3>
                    <Card className={`hover-lift border rounded-lg transition-smooth ${
                      prompt ? 'border-primary bg-primary/10' : 'border-input hover:border-primary'
                    }`}>
                      <CardContent className="p-0">
                        <Textarea
                          placeholder="Describe the scene or context for your UGC content..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Generate AI Content Button */}
                  <Button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                  >
                    {isGeneratingImage ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Wand2 className="h-5 w-5" />
                        Generate AI Image
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Preview */}
            <div className="space-y-6">
              {/* Preview Area */}
              <Card className="shadow-soft border-0 hover-lift">
                <CardHeader className="pb-4">
                  <CardTitle className="text-foreground text-2xl font-bold">
                    AI Photo Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/3] bg-muted rounded-lg border border-input overflow-hidden flex items-center justify-center min-h-80">
                    {isImageLoading && !generatedPhoto ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        <p className="text-foreground font-medium">
                          Generating your image...
                        </p>
                      </div>
                    ) : generatedPhoto ? (
                      <div className="relative w-full h-full">
                        <img
                          src={generatedPhoto}
                          alt="Generated UGC photo"
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={openLightbox}
                        />
                        {/* Regeneration overlay - show when regenerating */}
                        {(() => {
                          console.log('Regeneration overlay check - isRegeneratingImage:', isRegeneratingImage)
                          return isRegeneratingImage
                        })() && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
                            <p className="text-white font-medium mt-3">
                              Regenerating your image...
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={handleDownloadPhoto}
                          size="icon"
                          className="absolute top-3 right-3 h-10 w-10 bg-background/80 hover:bg-background text-foreground rounded-lg border border-input shadow-lg opacity-80 hover:opacity-100 transition-smooth"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">Your UGC photo will appear here</p>
                        <p className="text-sm mt-1">Upload a product and generate to see results</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generate Video Button */}
              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleRegenerateImage}
                  disabled={!imageJobId || isRegeneratingImage}
                  variant="outline"
                  className="h-12 px-6 border-primary text-primary hover:bg-primary/10 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                >
                  {isRegeneratingImage ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      Regenerating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Wand2 className="h-5 w-5" />
                      Regenerate
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={handleGenerateVideo}
                  disabled={!generatedPhoto || isGeneratingVideo || ((videoJobStatus?.status === 'queued' || videoJobStatus?.status === 'processing') && !generatedVideo)}
                  className="h-12 px-6 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
                >
                  {(isGeneratingVideo || ((videoJobStatus?.status === 'queued' || videoJobStatus?.status === 'processing') && !generatedVideo)) ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      {videoJobStatus?.status === 'queued' ? 'Queued...' : videoJobStatus?.status === 'processing' ? 'Processing...' : 'Creating Video...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5" />
                      Generate Video
                    </div>
                  )}
                </Button>
              </div>

              {/* Video Preview Area */}
              {videoJobId && (
                  <Card className="shadow-soft border-0 hover-lift mt-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-foreground text-2xl font-bold flex items-center gap-2">
                        <Video className="h-6 w-6 text-primary" />
                        Your UGC Video
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[4/3] bg-muted rounded-lg border border-input overflow-hidden flex items-center justify-center min-h-80">
                        {/* Show status if video is being generated and no video is available yet */}
                        {(videoJobStatus?.status === 'queued' || videoJobStatus?.status === 'processing') && !generatedVideo && (
                          <div className="flex flex-col items-center gap-4 p-6">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="text-lg font-medium">
                                {fakeProgressStage === 'preparing' && 'Preparing input...'}
                                {fakeProgressStage === 'generating' && 'Generating scenes...'}
                                {fakeProgressStage === 'finalizing' && 'Finalizing video...'}
                                {fakeProgressStage === 'waiting' && 'Still working on it!'}
                                {!fakeProgressStage && (
                                  videoJobStatus?.status === 'queued' ? 'Queued...' : 'Processing...'
                                )}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-center">
                              {fakeProgressStage === 'preparing' && 'Preparing your video input...'}
                              {fakeProgressStage === 'generating' && 'Creating scenes for your video...'}
                              {fakeProgressStage === 'finalizing' && 'Finalizing your video...'}
                              {fakeProgressStage === 'waiting' && 'Some videos take a little longer. Thanks for your patience.'}
                              {!fakeProgressStage && (
                                videoJobStatus?.status === 'queued' 
                                  ? 'Your video is in the queue and will be processed soon.' 
                                  : 'Your video is being generated. This may take a few minutes.'
                              )}
                            </p>
                          </div>
                        )}
                        
                        {/* Show error if video generation failed and no video is available */}
                        {videoJobStatus?.status === 'failed' && !generatedVideo && (
                          <div className="flex flex-col items-center gap-4 p-6">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <span className="text-lg font-medium text-destructive">Generation Failed</span>
                            <p className="text-muted-foreground text-center">
                              {videoJobStatus.error_message || videoJobStatus.error || "Video generation failed. Please try again."}
                            </p>
                            <Button 
                              onClick={handleGenerateVideo}
                              variant="outline"
                              className="mt-2"
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                        
                        {/* Show video when available */}
                        {generatedVideo && (
                          <div className="relative w-full h-full">
                            <video
                              src={generatedVideo}
                              controls
                              className="w-full h-full object-contain rounded-lg"
                              poster={generatedPhoto || undefined}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <Button
                              onClick={handleDownloadVideo}
                              size="icon"
                              className="absolute top-3 right-3 h-10 w-10 bg-background/80 hover:bg-background text-foreground rounded-lg border border-input shadow-lg opacity-80 hover:opacity-100 transition-smooth"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <Lightbox 
        imageUrl={generatedPhoto || ''} 
        isOpen={isLightboxOpen} 
        onClose={closeLightbox} 
      />

    </div>
  )
}

export default Generator