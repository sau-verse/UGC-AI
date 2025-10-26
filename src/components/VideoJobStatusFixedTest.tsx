import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVideoJobStatusRealtime } from '@/hooks/supabase/useVideoJobStatusRealtime';

/**
 * Test component to verify the real-time video job status hook
 */
const VideoJobStatusFixedTest = () => {
  const [jobId, setJobId] = useState<string>('');
  const { job, loading, error, refetch } = useVideoJobStatusRealtime(jobId || null);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Video Job Status Test (Final Hook)</CardTitle>
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
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">ID:</span>
              <span>{job.video_job_id}</span>

              <span className="font-medium">Status:</span>
              <span className={job.status === 'done' ? 'text-green-600' : job.status === 'failed' ? 'text-red-600' : ''}>
                {job.status}
              </span>

              {job.generated_video_url && (
                <>
                  <span className="font-medium">Video URL:</span>
                  <span className="truncate">{job.generated_video_url}</span>
                </>
              )}

              {job.error_message && (
                <>
                  <span className="font-medium">Error:</span>
                  <span className="text-red-600">{job.error_message}</span>
                </>
              )}
            </div>
          </div>
        )}

        {!jobId && !loading && (
          <p className="text-muted-foreground">Enter a video job ID to begin monitoring</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoJobStatusFixedTest;
