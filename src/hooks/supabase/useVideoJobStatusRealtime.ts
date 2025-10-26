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

export function useVideoJobStatusRealtime(jobId: string | null): VideoJobStatusState {
  const [job, setJob] = useState<VideoJobStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching video job status for:', jobId);
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*")
        .eq("video_job_id", jobId)
        .single();

      if (error) {
        console.error('Error fetching video job status:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('Fetched video job data:', data);
      console.log('Generated video URL in fetched data:', data?.generated_video_url);
      setJob(data);
      setLoading(false);
    } catch (err) {
      console.error('Exception fetching video job status:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    // fetch initial state
    fetchJobStatus();

    // subscribe to ALL updates, filter client-side
    const channel = supabase
      .channel("video-jobs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "video_jobs" },
        (payload) => {
          console.log('Realtime payload received:', payload);
          console.log('Payload event type:', payload.eventType);
          console.log('Payload new data:', payload.new);
          console.log('Payload old data:', payload.old);
          
          const newRow = payload.new as VideoJobStatus | null;
          console.log('Parsed new row:', newRow);
          console.log('New row video_job_id:', newRow?.video_job_id);
          console.log('Looking for jobId:', jobId);
          console.log('Match check:', newRow?.video_job_id === jobId);
          
          if (newRow?.video_job_id === jobId) {
            console.log('Updating job state with:', newRow);
            setJob(newRow);
          } else {
            console.log('No match - ignoring update');
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to video job updates for:', jobId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to video job updates for:', jobId);
        }
      });

    return () => {
      console.log('Cleaning up realtime subscription for job:', jobId);
      supabase.removeChannel(channel);
    };
  }, [jobId, fetchJobStatus]);

  return { job, loading, error, refetch: fetchJobStatus };
}
