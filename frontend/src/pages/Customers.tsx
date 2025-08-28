import React, { useState, useEffect } from 'react'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/v1/customers')
      if (!response.ok) throw new Error('Error al cargar clientes')
      const data = await response.json()
      setCustomers(data)
    } catch (err) {
      setError('Error al cargar los clientes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando clientes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <button onClick={fetchCustomers} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button className="btn btn-primary">
          ➕ Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>

        {customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">No se encontraron clientes</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Teléfono</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Fecha Registro</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {customer.email}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {customer.phone || 'No disponible'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(customer.createdAt).toLocaleDateString()}
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

export default Customers
