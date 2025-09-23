import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface ImageJobStatus {
  id: string;
  status: string;
  generated_image_url?: string;
  image_gen_url?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface ImageJobStatusState {
  job: ImageJobStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useImageJobStatusRealtime(jobId: string | null): ImageJobStatusState {
  const [job, setJob] = useState<ImageJobStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);

    try {
      console.log('[IMG RT] Fetching image job status for:', jobId);
      const { data, error } = await supabase
        .from("image_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        console.error('[IMG RT] Error fetching image job status:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('[IMG RT] Fetched image job data:', data);
      console.log('[IMG RT] Generated image URL (generated_image_url):', (data as any)?.generated_image_url);
      console.log('[IMG RT] Generated image URL (image_gen_url):', (data as any)?.image_gen_url);
      setJob(data as ImageJobStatus);
      setLoading(false);
    } catch (err) {
      console.error('[IMG RT] Exception fetching image job status:', err);
      setError((err as Error).message);
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let userChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      if (!jobId) return;

      console.log('[IMG RT] Setting up realtime subscription for image job:', jobId);
      // initial fetch
      await fetchJobStatus();

      const channelName = `image-job-${jobId}`;
      console.log('[IMG RT] Creating channel:', channelName);
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "image_jobs",
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            console.log('[IMG RT] Realtime image job UPDATE received:', payload);
            const newRow = payload.new as ImageJobStatus;
            console.log('[IMG RT] New row status:', newRow.status, 'generated_image_url:', newRow.generated_image_url, 'image_gen_url:', (newRow as any).image_gen_url);
            setJob(newRow);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "image_jobs",
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            console.log('[IMG RT] Realtime image job INSERT received:', payload);
            const newRow = payload.new as ImageJobStatus;
            setJob(newRow);
          }
        )
        .subscribe((status) => {
          console.log('[IMG RT] Realtime subscription status:', status);
        });

      // Additionally, listen for any new rows for this user, since some workflows insert a separate row
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      if (userId) {
        const userChannelName = `image-jobs-user-${userId}`;
        console.log('[IMG RT] Creating user channel:', userChannelName);
        userChannel = supabase
          .channel(userChannelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "image_jobs",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('[IMG RT] Realtime user INSERT received:', payload);
              const newRow = payload.new as ImageJobStatus;
              if (newRow.status === 'done' && (newRow.generated_image_url || (newRow as any).image_gen_url)) {
                console.log('[IMG RT] Found done image job for user; updating hook job state');
                setJob(newRow);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "image_jobs",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const newRow = payload.new as ImageJobStatus;
              if (newRow.status === 'done' && (newRow.generated_image_url || (newRow as any).image_gen_url)) {
                console.log('[IMG RT] Found user UPDATE to done with URL; updating hook job state');
                setJob(newRow);
              }
            }
          )
          .subscribe((status) => {
            console.log('[IMG RT] User realtime subscription status:', status);
          });
      }
    })();

    return () => {
      console.log('[IMG RT] Cleaning up realtime subscription for image job:', jobId);
      if (channel) supabase.removeChannel(channel);
      if (userChannel) supabase.removeChannel(userChannel);
    };
  }, [jobId, fetchJobStatus]);

  return { job, loading, error, refetch: fetchJobStatus };
}


