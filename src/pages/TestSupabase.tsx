import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/supabase/useAuth';

const TestSupabase = () => {
  const { user } = useAuth();
  const [imageJobs, setImageJobs] = useState<any[]>([]);
  const [videoJobs, setVideoJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('No user authenticated');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching data for user:', user.id);

        // Fetch image jobs
        const { data: imageJobsData, error: imageJobsError } = await supabase
          .from('image_jobs')
          .select('*')
          .eq('user_id', user.id);

        if (imageJobsError) {
          console.error('Error fetching image jobs:', imageJobsError);
          setError(`Image jobs error: ${imageJobsError.message}`);
        } else {
          console.log('Image jobs:', imageJobsData);
          setImageJobs(imageJobsData || []);
        }

        // Fetch video jobs
        const { data: videoJobsData, error: videoJobsError } = await supabase
          .from('video_jobs')
          .select('*')
          .eq('user_id', user.id);

        if (videoJobsError) {
          console.error('Error fetching video jobs:', videoJobsError);
          setError(`Video jobs error: ${videoJobsError.message}`);
        } else {
          console.log('Video jobs:', videoJobsData);
          setVideoJobs(videoJobsData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <p>User ID: {user?.id}</p>
        <p>User Email: {user?.email}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Image Jobs ({imageJobs.length})</h2>
        {imageJobs.length > 0 ? (
          <div className="space-y-2">
            {imageJobs.map((job) => (
              <div key={job.id} className="border p-2 rounded">
                <p><strong>ID:</strong> {job.id}</p>
                <p><strong>Prompt:</strong> {job.prompt}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <p><strong>Created:</strong> {job.created_at}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No image jobs found</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Video Jobs ({videoJobs.length})</h2>
        {videoJobs.length > 0 ? (
          <div className="space-y-2">
            {videoJobs.map((job) => (
              <div key={job.video_job_id} className="border p-2 rounded">
                <p><strong>ID:</strong> {job.video_job_id}</p>
                <p><strong>Prompt:</strong> {job.prompt}</p>
                <p><strong>Status:</strong> {job.status}</p>
                <p><strong>Created:</strong> {job.created_at}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No video jobs found</p>
        )}
      </div>
    </div>
  );
};

export default TestSupabase;