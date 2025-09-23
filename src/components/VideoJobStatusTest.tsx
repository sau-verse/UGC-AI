import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVideoJobStatusRealtime } from '@/hooks/supabase/useVideoJobStatusRealtime';

/**
 * Test component to demonstrate the real-time video job status hook
 */
const VideoJobStatusTest = () => {
  const [jobId, setJobId] = useState<string>('');
  const { job, loading, error, refetch } = useVideoJobStatusRealtime(jobId || null);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Video Job Status Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter video job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <Button onClick={refetch} disabled={loading || !jobId}>
            Refresh
          </Button>
        </div>

        {loading && <p>Loading job status...</p>}

        {error && (
          <div className="p-2 bg-red-100 text-red-800 rounded">
            Error: {error}
          </div>
        )}

        {job && (
          <div className="space-y-2">
            <h3 className="font-bold">Job Details:</h3>
            <p><strong>ID:</strong> {job.video_job_id}</p>
            <p><strong>Status:</strong> {job.status}</p>
            {job.generated_video_url && (
              <p><strong>Video URL:</strong> {job.generated_video_url}</p>
            )}
            {job.error_message && (
              <p><strong>Error:</strong> {job.error_message}</p>
            )}
          </div>
        )}

        {!jobId && !loading && (
          <p className="text-muted-foreground">Enter a video job ID to begin monitoring</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoJobStatusTest;
