import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-content">
            <h2 className="text-xl font-bold" style={{ color: '#1e40af' }}>🏨 HotelBot</h2>
          </div>
          <nav style={{ marginTop: '1.5rem' }}>
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActiveRoute('/dashboard') ? 'active' : ''}`}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/reservations" 
              className={`nav-item ${isActiveRoute('/reservations') ? 'active' : ''}`}
            >
              📋 Reservas
            </Link>
            <Link 
              to="/customers" 
              className={`nav-item ${isActiveRoute('/customers') ? 'active' : ''}`}
            >
              👥 Clientes
            </Link>
            <Link 
              to="/rooms" 
              className={`nav-item ${isActiveRoute('/rooms') ? 'active' : ''}`}
            >
              🏠 Habitaciones
            </Link>
            <Link 
              to="/room-types" 
              className={`nav-item ${isActiveRoute('/room-types') ? 'active' : ''}`}
            >
              🏨 Tipos de Habitación
            </Link>
            <Link 
              to="/meal-plans" 
              className={`nav-item ${isActiveRoute('/meal-plans') ? 'active' : ''}`}
            >
              🍽️ Planes de Comida
            </Link>
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
