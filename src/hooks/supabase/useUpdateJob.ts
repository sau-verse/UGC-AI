import { useState } from 'react'
import { UpdateJobRequest, UpdateJobResponse, updateJob } from '@/api/update-job'

export interface UpdateJobState {
  loading: boolean
  error: string | null
}

/**
 * Custom hook to update a job
 * @returns UpdateJobState and updateJob function
 */
export const useUpdateJob = () => {
  const [updateJobState, setUpdateJobState] = useState<UpdateJobState>({
    loading: false,
    error: null
  })

  /**
   * Update a job
   * @param jobData - The job data to update
   * @returns UpdateJobResponse with success status or error
   */
  const handleUpdateJob = async (jobData: UpdateJobRequest): Promise<UpdateJobResponse> => {
    setUpdateJobState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await updateJob(jobData)
      
      if (!result.success) {
        setUpdateJobState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to update job' }))
        return result
      }
      
      setUpdateJobState(prev => ({ ...prev, loading: false }))
      return result
    } catch (error) {
      setUpdateJobState(prev => ({ ...prev, loading: false, error: (error as Error).message }))
      return { success: false, error: (error as Error).message }
    }
  }

  return {
    ...updateJobState,
    updateJob: handleUpdateJob,
    reset: () => setUpdateJobState({ loading: false, error: null })
  }
}