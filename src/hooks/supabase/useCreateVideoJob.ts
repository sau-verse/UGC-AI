import { useState } from 'react'
import { CreateVideoJobRequest, CreateVideoJobResponse, createVideoJob } from '@/api/create-video-job'

export interface CreateVideoJobState {
  jobId: string | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook to create a new video job
 * @returns CreateVideoJobState and createVideoJob function
 */
export const useCreateVideoJob = () => {
  const [createVideoJobState, setCreateVideoJobState] = useState<CreateVideoJobState>({
    jobId: null,
    loading: false,
    error: null
  })

  /**
   * Create a new video job
   * @param jobData - The video job data to create
   * @returns CreateVideoJobResponse with jobId or error
   */
  const handleCreateVideoJob = async (jobData: CreateVideoJobRequest): Promise<CreateVideoJobResponse> => {
    setCreateVideoJobState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await createVideoJob(jobData)
      
      if (result.error) {
        setCreateVideoJobState(prev => ({ ...prev, loading: false, error: result.error }))
        return result
      }
      
      setCreateVideoJobState(prev => ({ 
        ...prev, 
        loading: false, 
        jobId: result.jobId || null 
      }))
      
      return result
    } catch (error) {
      setCreateVideoJobState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }))
      
      return { error: (error as Error).message }
    }
  }

  return {
    ...createVideoJobState,
    createVideoJob: handleCreateVideoJob,
    reset: () => setCreateVideoJobState({ jobId: null, loading: false, error: null })
  }
}