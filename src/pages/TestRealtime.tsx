import React from 'react';
import Navigation from '@/components/Navigation';
import VideoJobStatusTest from '@/components/VideoJobStatusTest';

const TestRealtime = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <main className="pt-24 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-6">
            Real-time Video Job Status Test
          </h1>
          <p className="text-muted-foreground mb-8">
            This page tests the new real-time implementation for monitoring video job status updates.
          </p>
          
          <VideoJobStatusTest />
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Create a video job in the Generator page</li>
              <li>Copy the video job ID from the console logs or database</li>
              <li>Paste the ID in the input field above</li>
              <li>Observe real-time updates as the job status changes</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestRealtime;