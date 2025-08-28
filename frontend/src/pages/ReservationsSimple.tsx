import React, { useState, useEffect } from 'react'

const ReservationsSimple: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:3000/api/v1/reservations')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🔄 Cargando reservas...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>❌ Error: {error}</h2>
        <button onClick={fetchReservations} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  const reservations = data?.data?.data || []

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📋 Gestión de Reservas</h1>
      <p>Total: {reservations.length} reservas</p>
      
      <div style={{ marginTop: '2rem' }}>
        {reservations.length === 0 ? (
          <p>No hay reservas disponibles</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Código</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Cliente</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Habitación</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Check-in</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Check-out</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Estado</th>
                <th style={{ padding: '1rem', border: '1px solid #ccc' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation: any) => (
                <tr key={reservation.id}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {reservation.reservationCode}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {reservation.customer?.firstName} {reservation.customer?.lastName}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {reservation.room?.number}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {new Date(reservation.checkInDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {new Date(reservation.checkOutDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: reservation.status === 'CONFIRMED' ? '#10b981' : 
                                     reservation.status === 'PENDING' ? '#f59e0b' : '#6b7280',
                      color: 'white'
                    }}>
                      {reservation.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    ${reservation.totalAmount?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ReservationsSimple
