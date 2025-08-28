import React from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-content">
            <h2 className="text-xl font-bold" style={{ color: '#1e40af' }}>🏨 HotelBot</h2>
          </div>
          <nav style={{ marginTop: '1.5rem' }}>
            <a href="/dashboard" className="nav-item">
              📊 Dashboard
            </a>
            <a href="/reservations" className="nav-item">
              📋 Reservas
            </a>
            <a href="/customers" className="nav-item">
              👥 Clientes
            </a>
            <a href="/rooms" className="nav-item">
              🏠 Habitaciones
            </a>
            <a href="/room-types" className="nav-item">
              🏨 Tipos de Habitación
            </a>
            <a href="/meal-plans" className="nav-item">
              🍽️ Planes de Comida
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="main-content">
          <header className="bg-white shadow border" style={{ borderColor: '#e5e7eb', marginBottom: '0' }}>
            <div style={{ padding: '1rem 2rem' }}>
              <h1 className="text-2xl font-medium text-gray-800">
                Sistema de Gestión Hotelera
              </h1>
            </div>
          </header>
          
          <main style={{ padding: '2rem' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
