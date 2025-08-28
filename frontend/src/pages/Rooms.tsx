import React, { useState, useEffect } from 'react'

interface Room {
  id: number
  number: string
  type: string
  status: string
  price: number
  capacity: number
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/v1/rooms')
      if (!response.ok) throw new Error('Error al cargar habitaciones')
      const data = await response.json()
      setRooms(data)
    } catch (err) {
      setError('Error al cargar las habitaciones')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#10b981'
      case 'occupied': return '#ef4444'
      case 'maintenance': return '#f59e0b'
      case 'cleaning': return '#6366f1'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'Disponible'
      case 'occupied': return 'Ocupada'
      case 'maintenance': return 'Mantenimiento'
      case 'cleaning': return 'Limpieza'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando habitaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={fetchRooms} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-gray-800">Habitaciones</h1>
        <button className="btn btn-primary">
          ➕ Nueva Habitación
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Todas
        </button>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Disponibles
        </button>
        <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>
          Ocupadas
        </button>
        <button className="btn btn-secondary">
          Mantenimiento
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar habitaciones..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">No se encontraron habitaciones</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem'
          }}>
            {rooms.map((room) => (
              <div key={room.id} className="card" style={{ margin: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 className="font-medium text-gray-800" style={{ fontSize: '1.25rem' }}>
                      Habitación {room.number}
                    </h3>
                    <p className="text-gray-600">
                      {room.type}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: getStatusColor(room.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {getStatusText(room.status)}
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p className="text-gray-600">
                    <strong>Capacidad:</strong> {room.capacity} persona{room.capacity !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-600">
                    <strong>Precio:</strong> ${room.price.toLocaleString()} / noche
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: '1', fontSize: '0.875rem' }}>
                    Ver Detalles
                  </button>
                  <button className="btn btn-primary" style={{ flex: '1', fontSize: '0.875rem' }}>
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rooms
