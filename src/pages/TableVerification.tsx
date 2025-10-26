import { useEffect, useState } from 'react'
import { verifyTables } from '@/lib/verifyTables'

export default function TableVerification() {
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runVerification = async () => {
      setLoading(true)
      const result = await verifyTables()
      setVerificationResult(result)
      setLoading(false)
    }

    runVerification()
  }, [])

  if (loading) {
    return <div className="p-4">Checking database tables...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Table Verification</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Image Jobs Table</h2>
          <p>Status: {verificationResult?.imageJobsExists ? '✅ Exists' : '❌ Missing'}</p>
          {verificationResult?.errors?.imageJobs && (
            <p className="text-red-500">Error: {verificationResult.errors.imageJobs.message}</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">Video Jobs Table</h2>
          <p>Status: {verificationResult?.videoJobsExists ? '✅ Exists' : '❌ Missing'}</p>
          {verificationResult?.errors?.videoJobs && (
            <p className="text-red-500">Error: {verificationResult.errors.videoJobs.message}</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">Profiles Table</h2>
          <p>Status: {verificationResult?.profilesExists ? '✅ Exists' : '❌ Missing'}</p>
          {verificationResult?.errors?.profiles && (
            <p className="text-red-500">Error: {verificationResult.errors.profiles.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}