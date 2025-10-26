import { useState, useEffect } from 'react'
import { VideoJobStatusResponse, getVideoJobStatus } from '@/api/video-job-status'

export interface VideoJobStatusState {
  data: VideoJobStatusResponse | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook to get the status of a video job
 * @param jobId - The ID of the video job to check
 * @returns VideoJobStatusState and refetch function
 */
export const useVideoJobStatus = (jobId: string | null) => {
  const [videoJobStatusState, setVideoJobStatusState] = useState<VideoJobStatusState>({
    data: null,
    loading: false,
    error: null
  })

  const fetchVideoJobStatus = async () => {
    if (!jobId) {
      setVideoJobStatusState(prev => ({ 
        ...prev, 
        data: null,
        loading: false,
        error: 'No job ID provided' 
      }))
      return
    }

    setVideoJobStatusState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await getVideoJobStatus(jobId)
      
      if (result.error) {
        setVideoJobStatusState(prev => ({ ...prev, loading: false, error: result.error }))
        return
      }
      
      setVideoJobStatusState(prev => ({ 
        ...prev, 
        loading: false, 
        data: result 
      }))
    } catch (error) {
      setVideoJobStatusState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }))
    }
  }

  // Fetch status when jobId changes
  useEffect(() => {
    fetchVideoJobStatus()
  }, [jobId])

  return {
    ...videoJobStatusState,
    refetch: fetchVideoJobStatus,
    fetchVideoJobStatus
  }
}