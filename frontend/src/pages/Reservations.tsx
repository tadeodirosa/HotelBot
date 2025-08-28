import React, { useState, useEffect } from 'react'

interface Reservation {
  id: number
  customerName: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: string
  totalAmount: number
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/v1/reservations')
      if (!response.ok) throw new Error('Error al cargar reservas')
      const data = await response.json()
      setReservations(data)
    } catch (err) {
      setError('Error al cargar las reservas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'cancelled': return '#ef4444'
      case 'completed': return '#6366f1'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando reservas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={fetchReservations} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-gray-800">Reservas</h1>
        <button className="btn btn-primary">
          ➕ Nueva Reserva
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Todas
        </button>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Pendientes
        </button>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Confirmadas
        </button>
        <button className="btn btn-secondary">
          Completadas
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar reservas..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">No se encontraron reservas</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Cliente</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Habitación</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Check-in</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Check-out</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {reservation.customerName}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {reservation.roomNumber}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(reservation.checkIn).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(reservation.checkOut).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        backgroundColor: getStatusColor(reservation.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {reservation.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      ${reservation.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>
                        Ver
                      </button>
                      <button className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reservations
