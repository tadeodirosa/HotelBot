import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold text-white mb-4">🏨 HotelBot</h1>
          <p className="text-white" style={{ opacity: '0.9' }}>Sistema de Gestión Hotelera</p>
        </div>
        
        <div className="card">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
