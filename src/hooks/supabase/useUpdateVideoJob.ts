import { useState } from 'react'
import { UpdateVideoJobRequest, UpdateVideoJobResponse, updateVideoJob } from '@/api/update-video-job'

export interface UpdateVideoJobState {
  loading: boolean
  error: string | null
}

/**
 * Custom hook to update a video job
 * @returns UpdateVideoJobState and updateVideoJob function
 */
export const useUpdateVideoJob = () => {
  const [updateVideoJobState, setUpdateVideoJobState] = useState<UpdateVideoJobState>({
    loading: false,
    error: null
  })

  /**
   * Update a video job
   * @param jobData - The video job data to update
   * @returns UpdateVideoJobResponse with success status or error
   */
  const handleUpdateVideoJob = async (jobData: UpdateVideoJobRequest): Promise<UpdateVideoJobResponse> => {
    setUpdateVideoJobState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await updateVideoJob(jobData)
      
      if (!result.success) {
        setUpdateVideoJobState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to update video job' }))
        return result
      }
      
      setUpdateVideoJobState(prev => ({ ...prev, loading: false }))
      return result
    } catch (error) {
      setUpdateVideoJobState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    ...updateVideoJobState,
    updateVideoJob: handleUpdateVideoJob,
    reset: () => setUpdateVideoJobState({ loading: false, error: null })
  }
}