import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/testSupabase'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTest = async () => {
      setLoading(true)
      const result = await testSupabaseConnection()
      setTestResult(result)
      setLoading(false)
    }

    runTest()
  }, [])

  if (loading) {
    return <div className="p-4">Testing Supabase connection...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Authentication</h2>
          <pre>{JSON.stringify(testResult?.auth, null, 2)}</pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">Database Tables</h2>
          <pre>{JSON.stringify(testResult?.tables, null, 2)}</pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">Image Jobs Table Access</h2>
          <pre>{JSON.stringify(testResult?.imageJobs, null, 2)}</pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">Video Jobs Table Access</h2>
          <pre>{JSON.stringify(testResult?.videoJobs, null, 2)}</pre>
        </div>
        
        {testResult?.error && (
          <div>
            <h2 className="text-xl font-semibold">General Error</h2>
            <pre className="text-red-500">{JSON.stringify(testResult.error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}