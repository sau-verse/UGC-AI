import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/supabase/useAuth';

const DatabaseTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const runTests = async () => {
      if (!user) return;

      const results: any = {};

      // Test 1: Check if we can access image_jobs table
      try {
        // First try without any filters to see if table is accessible
        const { data: allData, error: allError } = await supabase
          .from('image_jobs')
          .select('*')
          .limit(1);
        
        console.log('All image jobs test:', { data: allData, error: allError });
        
        // Then try with user filter
        const { data, error } = await supabase
          .from('image_jobs')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);
        
        results.imageJobs = {
          success: !error,
          error: error?.message,
          errorDetails: error ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          } : null,
          count: data?.length || 0,
          data: data,
          allDataTest: {
            success: !allError,
            error: allError?.message,
            count: allData?.length || 0
          }
        };
      } catch (err) {
        results.imageJobs = {
          success: false,
          error: (err as Error).message
        };
      }

      // Test 2: Check if we can access video_jobs table
      try {
        const { data, error } = await supabase
          .from('video_jobs')
          .select('*')
          .limit(5);
        
        results.videoJobs = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          data: data
        };
      } catch (err) {
        results.videoJobs = {
          success: false,
          error: (err as Error).message
        };
      }

      // Test 3: Check if we can access video_jobs_with_context view
      try {
        const { data, error } = await supabase
          .from('video_jobs_with_context')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);
        
        results.videoJobsWithContext = {
          success: !error,
          error: error?.message,
          count: data?.length || 0,
          data: data
        };
      } catch (err) {
        results.videoJobsWithContext = {
          success: false,
          error: (err as Error).message
        };
      }

      setTestResults(results);
    };

    runTests();
  }, [user]);

  if (!user) {
    return <div>Please log in to test database access</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Database Connection Test</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">User Info:</h4>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Image Jobs Table:</h4>
          <p>Success: {testResults.imageJobs?.success ? '✅' : '❌'}</p>
          <p>Count: {testResults.imageJobs?.count || 0}</p>
          {testResults.imageJobs?.error && (
            <div className="text-red-500">
              <p>Error: {testResults.imageJobs.error}</p>
              {testResults.imageJobs?.errorDetails && (
                <div className="text-xs mt-2">
                  <p>Code: {testResults.imageJobs.errorDetails.code}</p>
                  <p>Details: {testResults.imageJobs.errorDetails.details}</p>
                  <p>Hint: {testResults.imageJobs.errorDetails.hint}</p>
                </div>
              )}
            </div>
          )}
          {testResults.imageJobs?.allDataTest && (
            <div className="text-sm mt-2">
              <p>All Data Test: {testResults.imageJobs.allDataTest.success ? '✅' : '❌'}</p>
              {testResults.imageJobs.allDataTest.error && (
                <p className="text-red-500 text-xs">All Data Error: {testResults.imageJobs.allDataTest.error}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium">Video Jobs Table:</h4>
          <p>Success: {testResults.videoJobs?.success ? '✅' : '❌'}</p>
          <p>Count: {testResults.videoJobs?.count || 0}</p>
          {testResults.videoJobs?.error && (
            <p className="text-red-500">Error: {testResults.videoJobs.error}</p>
          )}
        </div>

        <div>
          <h4 className="font-medium">Video Jobs With Context View:</h4>
          <p>Success: {testResults.videoJobsWithContext?.success ? '✅' : '❌'}</p>
          <p>Count: {testResults.videoJobsWithContext?.count || 0}</p>
          {testResults.videoJobsWithContext?.error && (
            <p className="text-red-500">Error: {testResults.videoJobsWithContext.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;
