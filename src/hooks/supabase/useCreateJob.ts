import { useState } from 'react'
import { CreateJobRequest, CreateJobResponse, createJob } from '@/api/create-job'

export interface CreateJobState {
  jobId: string | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook to create a new job
 * @returns CreateJobState and createJob function
 */
export const useCreateJob = () => {
  const [createJobState, setCreateJobState] = useState<CreateJobState>({
    jobId: null,
    loading: false,
    error: null
  })

  /**
   * Create a new job
   * @param jobData - The job data to create
   * @returns CreateJobResponse with jobId or error
   */
  const handleCreateJob = async (jobData: CreateJobRequest): Promise<CreateJobResponse> => {
    setCreateJobState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await createJob(jobData)
      
      if (result.error) {
        setCreateJobState(prev => ({ ...prev, loading: false, error: result.error }))
        return result
      }
      
      setCreateJobState(prev => ({ 
        ...prev, 
        loading: false, 
        jobId: result.jobId || null 
      }))
      
      return result
    } catch (error) {
      setCreateJobState(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message 
      }))
      
      return { error: (error as Error).message }
    }
  }

  return {
    ...createJobState,
    createJob: handleCreateJob,
    reset: () => setCreateJobState({ jobId: null, loading: false, error: null })
  }
}