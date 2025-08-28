import React, { useState, useEffect } from 'react'

const ReservationsDebug: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')

  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Testing API connection...')
      console.log('URL:', 'http://localhost:3000/api/v1/reservations')
      
      const response = await fetch('http://localhost:3000/api/v1/reservations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      const responseText = await response.text()
      setRawResponse(responseText)
      console.log('📦 Raw response:', responseText)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const jsonData = JSON.parse(responseText)
      console.log('✅ Parsed data:', jsonData)
      setData(jsonData)
      
    } catch (err) {
      console.error('❌ API Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🔧 API Debug - Reservations</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testApiConnection}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry API Call
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h3>📊 Status:</h3>
          <p>Loading: {loading ? '✅' : '❌'}</p>
          <p>Error: {error || '❌'}</p>
        </div>

        {rawResponse && (
          <div>
            <h3>📦 Raw Response:</h3>
            <pre style={{ 
              background: '#f3f4f6', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {rawResponse}
            </pre>
          </div>
        )}

        {data && (
          <div>
            <h3>✅ Parsed Data:</h3>
            <pre style={{ 
              background: '#ecfdf5', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div>
            <h3>❌ Error Details:</h3>
            <pre style={{ 
              background: '#fef2f2', 
              padding: '1rem', 
              borderRadius: '4px',
              color: '#dc2626'
            }}>
              {error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationsDebug
