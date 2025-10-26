import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { JobStatusResponse, getJobStatus } from '@/api/job-status'

export interface JobStatusState {
  job: JobStatusResponse | null
  loading: boolean
  error: string | null
}

/**
 * Custom hook to get job status and subscribe to real-time updates
 * @param jobId - The ID of the job to monitor
 * @returns JobStatusState object with job data, loading, and error states
 */
export const useJobStatus = (jobId: string | null) => {
  const [jobStatus, setJobStatus] = useState<JobStatusState>({
    job: null,
    loading: false,
    error: null
  })

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return
    
    setJobStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await getJobStatus(jobId)
      
      if (result.error) {
        setJobStatus(prev => ({ ...prev, loading: false, error: result.error }))
        return
      }
      
      setJobStatus(prev => ({ ...prev, loading: false, job: result }))
    } catch (error) {
      setJobStatus(prev => ({ ...prev, loading: false, error: (error as Error).message }))
    }
  }, [jobId])

  useEffect(() => {
    // Reset state when jobId changes
    setJobStatus({
      job: null,
      loading: false,
      error: null
    })
    
    if (!jobId) return
    
    // Fetch initial status
    fetchJobStatus()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`job-status:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          const updatedJob = payload.new as JobStatusResponse
          setJobStatus(prev => ({ ...prev, job: updatedJob }))
        }
      )
      .subscribe()
    
    // Set up polling as fallback (every 10 seconds)
    const interval = setInterval(() => {
      if (jobStatus.job?.status === 'queued' || jobStatus.job?.status === 'processing') {
        fetchJobStatus()
      }
    }, 10000)
    
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [jobId, fetchJobStatus, jobStatus.job?.status])

  return {
    ...jobStatus,
    refetch: fetchJobStatus
  }
}