import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/supabase/useAuth';

const TestDataFetch = () => {
  const { user } = useAuth();
  const [imageJobs, setImageJobs] = useState<any[]>([]);
  const [videoJobs, setVideoJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('No user authenticated');
        setLoading(false);
        return;
      }

      console.log('Fetching data for user ID:', user.id);
      setLoading(true);

      try {
        // Test image_jobs table
        console.log('Fetching image jobs...');
        const { data: imageJobsData, error: imageJobsError, count: imageJobsCount } = await supabase
          .from('image_jobs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (imageJobsError) {
          console.error('Image jobs error:', imageJobsError);
          setError(`Image jobs error: ${imageJobsError.message}`);
        } else {
          console.log('Image jobs data:', imageJobsData);
          console.log('Image jobs count:', imageJobsCount);
          setImageJobs(imageJobsData || []);
        }

        // Test video_jobs table
        console.log('Fetching video jobs...');
        const { data: videoJobsData, error: videoJobsError, count: videoJobsCount } = await supabase
          .from('video_jobs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (videoJobsError) {
          console.error('Video jobs error:', videoJobsError);
          setError(`Video jobs error: ${videoJobsError.message}`);
        } else {
          console.log('Video jobs data:', videoJobsData);
          console.log('Video jobs count:', videoJobsCount);
          setVideoJobs(videoJobsData || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Fetch Test</h1>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Fetch Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        {user ? (
          <div>
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        ) : (
          <p>No user authenticated</p>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Image Jobs ({imageJobs.length})</h2>
        {imageJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Prompt</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Created At</th>
                  <th className="py-2 px-4 border-b text-left">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {imageJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2 px-4 border-b">{job.id}</td>
                    <td className="py-2 px-4 border-b">{job.prompt}</td>
                    <td className="py-2 px-4 border-b">{job.status}</td>
                    <td className="py-2 px-4 border-b">{job.created_at}</td>
                    <td className="py-2 px-4 border-b">{job.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No image jobs found</p>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Video Jobs ({videoJobs.length})</h2>
        {videoJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Prompt</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Created At</th>
                  <th className="py-2 px-4 border-b text-left">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {videoJobs.map((job) => (
                  <tr key={job.video_job_id}>
                    <td className="py-2 px-4 border-b">{job.video_job_id}</td>
                    <td className="py-2 px-4 border-b">{job.prompt}</td>
                    <td className="py-2 px-4 border-b">{job.status}</td>
                    <td className="py-2 px-4 border-b">{job.created_at}</td>
                    <td className="py-2 px-4 border-b">{job.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No video jobs found</p>
        )}
      </div>
    </div>
  );
};

export default TestDataFetch;