import React from 'react'
import { useAuthStore } from '../shared/store/useAuthStore.ts'

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600" style={{ marginTop: '0.25rem' }}>
            Bienvenido, {user?.firstName || 'Usuario'} {user?.lastName || ''}
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Cerrar Sesión
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="font-medium text-gray-800 mb-2">Reservas Hoy</h3>
          <p className="text-2xl font-bold text-gray-800">12</p>
          <p className="text-gray-600">+3 desde ayer</p>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-gray-800 mb-2">Habitaciones Ocupadas</h3>
          <p className="text-2xl font-bold text-gray-800">8/10</p>
          <p className="text-gray-600">80% ocupación</p>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-gray-800 mb-2">Ingresos del Mes</h3>
          <p className="text-2xl font-bold text-gray-800">$45,230</p>
          <p className="text-gray-600">+15% vs mes anterior</p>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-gray-800 mb-2">Clientes Activos</h3>
          <p className="text-2xl font-bold text-gray-800">156</p>
          <p className="text-gray-600">+8 nuevos esta semana</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Acciones Rápidas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <a href="/reservations" className="btn btn-primary">
            ➕ Nueva Reserva
          </a>
          <a href="/customers" className="btn btn-secondary">
            👥 Ver Clientes
          </a>
          <a href="/rooms" className="btn btn-secondary">
            🏠 Gestionar Habitaciones
          </a>
          <a href="/room-types" className="btn btn-secondary">
            🏨 Tipos de Habitación
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Actividad Reciente</h3>
        <div>
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', marginBottom: '0.75rem' }}>
            <p className="text-gray-800">Nueva reserva creada - Habitación 201</p>
            <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>Hace 5 minutos</p>
          </div>
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', marginBottom: '0.75rem' }}>
            <p className="text-gray-800">Cliente Juan Pérez registrado</p>
            <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>Hace 15 minutos</p>
          </div>
          <div>
            <p className="text-gray-800">Habitación 105 marcada como disponible</p>
            <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>Hace 1 hora</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
