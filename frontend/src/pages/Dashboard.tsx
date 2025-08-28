import React from 'react'
import { useAuthStore } from '../shared/store/useAuthStore.ts'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
}

interface QuickActionProps {
  title: string
  icon: string
  href: string
  variant?: 'primary' | 'secondary'
}

interface ActivityItemProps {
  message: string
  time: string
  type: 'reservation' | 'customer' | 'room' | 'general'
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, trend = 'neutral' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#10b981'
      case 'down': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 className="font-medium text-gray-600" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-800" style={{ marginBottom: '0.25rem' }}>
            {value}
          </p>
          <p className="text-gray-600" style={{ fontSize: '0.875rem', color: getTrendColor() }}>
            {subtitle}
          </p>
        </div>
        <div style={{ 
          fontSize: '2rem', 
          opacity: 0.7,
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, href, variant = 'secondary' }) => {
  return (
    <a 
      href={href} 
      className={`btn btn-${variant}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        minHeight: '5rem'
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{title}</span>
    </a>
  )
}

const ActivityItem: React.FC<ActivityItemProps> = ({ message, time, type }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'reservation': return '📋'
      case 'customer': return '👤'
      case 'room': return '🏠'
      default: return '📌'
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '0.75rem',
      paddingBottom: '0.75rem', 
      borderBottom: '1px solid #f3f4f6', 
      marginBottom: '0.75rem' 
    }}>
      <div style={{ 
        fontSize: '1.25rem',
        backgroundColor: '#f9fafb',
        borderRadius: '50%',
        width: '2.5rem',
        height: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {getTypeIcon()}
      </div>
      <div style={{ flex: 1 }}>
        <p className="text-gray-800" style={{ marginBottom: '0.25rem' }}>{message}</p>
        <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>{time}</p>
      </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1400px', 
      margin: '0 auto',
      padding: '0 1rem'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.firstName || 'Usuario'} {user?.lastName || ''}
            <span style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
              📅 {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>🚪</span>
          Cerrar Sesión
        </button>
      </div>

      {/* Stats Cards Grid - 4 columnas iguales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        width: '100%'
      }}>
        <StatsCard
          title="Reservas Hoy"
          value="12"
          subtitle="+3 desde ayer"
          icon="📋"
          trend="up"
        />
        <StatsCard
          title="Habitaciones Ocupadas"
          value="8/10"
          subtitle="80% ocupación"
          icon="🏠"
          trend="up"
        />
        <StatsCard
          title="Ingresos del Mes"
          value="$45,230"
          subtitle="+15% vs mes anterior"
          icon="💰"
          trend="up"
        />
        <StatsCard
          title="Clientes Activos"
          value="156"
          subtitle="+8 nuevos esta semana"
          icon="👥"
          trend="up"
        />
      </div>

      {/* Two Column Layout - Mejor distribución */}
            {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '2rem', 
        marginBottom: '2rem',
        width: '100%'
      }}>
        
        {/* Quick Actions */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <h3 className="font-medium text-gray-800">Acciones Rápidas</h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem' 
          }}>
            <QuickAction
              title="Nueva Reserva"
              icon="➕"
              href="/reservations"
              variant="primary"
            />
            <QuickAction
              title="Ver Clientes"
              icon="👥"
              href="/customers"
            />
            <QuickAction
              title="Habitaciones"
              icon="🏠"
              href="/rooms"
            />
            <QuickAction
              title="Tipos de Habitación"
              icon="🏨"
              href="/room-types"
            />
            <QuickAction
              title="Planes de Comida"
              icon="🍽️"
              href="/meal-plans"
            />
            <QuickAction
              title="Reportes"
              icon="📊"
              href="/reports"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>🕒</span>
            <h3 className="font-medium text-gray-800">Actividad Reciente</h3>
          </div>
          <div>
            <ActivityItem
              message="Nueva reserva creada - Habitación 201"
              time="Hace 5 minutos"
              type="reservation"
            />
            <ActivityItem
              message="Cliente Juan Pérez registrado"
              time="Hace 15 minutos"
              type="customer"
            />
            <ActivityItem
              message="Habitación 105 marcada como disponible"
              time="Hace 1 hora"
              type="room"
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <a 
                href="/activity" 
                className="text-gray-600"
                style={{ 
                  fontSize: '0.875rem', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Ver toda la actividad →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - 2 columnas iguales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        width: '100%'
      }}>
        {/* Occupancy Overview */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <h3 className="font-medium text-gray-800">Estado de Ocupación</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '0.5rem',
              border: '1px solid #bbf7d0'
            }}>
              <span className="text-gray-700 font-medium">🟢 Disponibles</span>
              <span className="font-bold text-green-600" style={{ fontSize: '1.125rem' }}>2</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#eff6ff',
              borderRadius: '0.5rem',
              border: '1px solid #bfdbfe'
            }}>
              <span className="text-gray-700 font-medium">🔵 Ocupadas</span>
              <span className="font-bold text-blue-600" style={{ fontSize: '1.125rem' }}>8</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#fffbeb',
              borderRadius: '0.5rem',
              border: '1px solid #fed7aa'
            }}>
              <span className="text-gray-700 font-medium">🟡 Mantenimiento</span>
              <span className="font-bold text-orange-600" style={{ fontSize: '1.125rem' }}>0</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              borderRadius: '0.5rem',
              border: '1px solid #fecaca'
            }}>
              <span className="text-gray-700 font-medium">🔴 Fuera de Servicio</span>
              <span className="font-bold text-red-600" style={{ fontSize: '1.125rem' }}>0</span>
            </div>
          </div>
        </div>

        {/* Next Check-ins */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>🛎️</span>
            <h3 className="font-medium text-gray-800">Próximos Check-ins</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#2563eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  MG
                </div>
                <div>
                  <p className="font-medium text-gray-800">María González</p>
                  <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>Habitación 205</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="font-bold text-gray-800" style={{ fontSize: '1.125rem' }}>14:00</span>
                <p className="text-gray-600" style={{ fontSize: '0.75rem' }}>Hoy</p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  CR
                </div>
                <div>
                  <p className="font-medium text-gray-800">Carlos Ruiz</p>
                  <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>Habitación 302</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="font-bold text-gray-800" style={{ fontSize: '1.125rem' }}>15:30</span>
                <p className="text-gray-600" style={{ fontSize: '0.75rem' }}>Hoy</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a 
                href="/check-ins" 
                className="text-gray-600"
                style={{ 
                  fontSize: '0.875rem', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Ver todos los check-ins →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
