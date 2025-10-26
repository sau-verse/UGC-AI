import { useEffect, useState } from 'react'
import { refreshSchema } from '@/lib/refreshSchema'

export default function SchemaRefresh() {
  const [refreshResult, setRefreshResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runRefresh = async () => {
      setLoading(true)
      const result = await refreshSchema()
      setRefreshResult(result)
      setLoading(false)
    }

    runRefresh()
  }, [])

  if (loading) {
    return <div className="p-4">Refreshing Supabase schema...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Schema Refresh</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Refresh Result</h2>
          <pre>{JSON.stringify(refreshResult, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}