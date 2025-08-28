import React, { useState, useEffect } from 'react'

interface RoomType {
  id: number
  name: string
  description: string
  basePrice: number
  maxCapacity: number
  amenities: string[]
}

const RoomTypes: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/v1/room-types')
      if (!response.ok) throw new Error('Error al cargar tipos de habitación')
      const data = await response.json()
      setRoomTypes(data)
    } catch (err) {
      setError('Error al cargar los tipos de habitación')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando tipos de habitación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={fetchRoomTypes} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-gray-800">Tipos de Habitación</h1>
        <button className="btn btn-primary">
          ➕ Nuevo Tipo
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar tipos de habitación..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {roomTypes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">No se encontraron tipos de habitación</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem'
          }}>
            {roomTypes.map((roomType) => (
              <div key={roomType.id} className="card" style={{ margin: '0' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 className="font-medium text-gray-800" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {roomType.name}
                  </h3>
                  <p className="text-gray-600" style={{ marginBottom: '1rem' }}>
                    {roomType.description}
                  </p>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-gray-600">
                      <strong>Precio Base:</strong>
                    </span>
                    <span className="text-gray-800 font-medium">
                      ${roomType.basePrice.toLocaleString()} / noche
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-gray-600">
                      <strong>Capacidad Máxima:</strong>
                    </span>
                    <span className="text-gray-800 font-medium">
                      {roomType.maxCapacity} persona{roomType.maxCapacity !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {roomType.amenities && roomType.amenities.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="font-medium text-gray-800" style={{ marginBottom: '0.5rem' }}>
                      Amenidades:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {roomType.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: '1', fontSize: '0.875rem' }}>
                    Editar
                  </button>
                  <button className="btn btn-primary" style={{ flex: '1', fontSize: '0.875rem' }}>
                    Ver Habitaciones
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

export default RoomTypes
