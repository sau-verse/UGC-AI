import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface VideoJobStatus {
  video_job_id: string;
  status: string;
  generated_video_url?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface VideoJobStatusState {
  job: VideoJobStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVideoJobStatusRealtimeFixed(jobId: string | null): VideoJobStatusState {
  const [job, setJob] = useState<VideoJobStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);

    try {
      console.log('[FIXED RT] Fetching video job status for:', jobId);
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("video_job_id", jobId)
        .single();

      if (error) {
        console.error('[FIXED RT] Error fetching video job status:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('[FIXED RT] Fetched video job data:', data);
      console.log('[FIXED RT] Generated video URL in fetched data:', data?.generated_video_url);
      setJob(data);
      setLoading(false);
    } catch (err) {
      console.error('[FIXED RT] Exception fetching video job status:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    console.log('[FIXED RT] Setting up realtime subscription for job:', jobId);

    // fetch initial state
    fetchJobStatus();

    // Create a unique channel name for this job
    const channelName = `video-job-${jobId}`;
    console.log('[FIXED RT] Creating channel:', channelName);

    // subscribe to updates with proper filtering
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "video_jobs",
          filter: `video_job_id=eq.${jobId}` // Properly filter for this specific job
        },
        (payload) => {
          console.log('[FIXED RT] Realtime video job UPDATE received:', payload);
          console.log('[FIXED RT] Payload new data:', payload.new);
          console.log('[FIXED RT] Payload old data:', payload.old);
          
          const newRow = payload.new as VideoJobStatus;
          console.log('[FIXED RT] Updating job state with:', newRow);
          setJob(newRow);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "video_jobs",
          filter: `video_job_id=eq.${jobId}` // Also listen for INSERT events
        },
        (payload) => {
          console.log('[FIXED RT] Realtime video job INSERT received:', payload.new);
          const newJob = payload.new as VideoJobStatus;
          setJob(newJob);
        }
      )
      .subscribe((status) => {
        console.log('[FIXED RT] Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[FIXED RT] ✅ Successfully subscribed to video job updates for:', jobId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[FIXED RT] ❌ Error subscribing to video job updates for:', jobId);
        }
      });

    return () => {
      console.log('[FIXED RT] Cleaning up realtime subscription for job:', jobId);
      supabase.removeChannel(channel);
    };
  }, [jobId, fetchJobStatus]);

  return { job, loading, error, refetch: fetchJobStatus };
}
