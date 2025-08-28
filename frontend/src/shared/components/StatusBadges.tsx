import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
type BadgeSize = 'sm' | 'md' | 'lg'

interface StatusBadgeProps {
  children: React.ReactNode
  variant: BadgeVariant
  size?: BadgeSize
  className?: string
  icon?: React.ReactNode
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant,
  size = 'md',
  className = '',
  icon
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full"
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800'
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
}

// Badges específicos para estados de reserva
interface ReservationStatusBadgeProps {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN' | 'CHECKED_OUT'
  className?: string
}

export const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const statusConfig = {
    PENDING: { variant: 'warning' as const, text: 'Pendiente', icon: '⏳' },
    CONFIRMED: { variant: 'success' as const, text: 'Confirmada', icon: '✅' },
    CANCELLED: { variant: 'error' as const, text: 'Cancelada', icon: '❌' },
    COMPLETED: { variant: 'info' as const, text: 'Completada', icon: '🎉' },
    CHECKED_IN: { variant: 'primary' as const, text: 'Check-in', icon: '🏠' },
    CHECKED_OUT: { variant: 'neutral' as const, text: 'Check-out', icon: '🚪' }
  }

  const config = statusConfig[status]

  return (
    <StatusBadge 
      variant={config.variant} 
      className={className}
      icon={<span>{config.icon}</span>}
    >
      {config.text}
    </StatusBadge>
  )
}

// Badges para estados de habitación
interface RoomStatusBadgeProps {
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  className?: string
}

export const RoomStatusBadge: React.FC<RoomStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const statusConfig = {
    AVAILABLE: { variant: 'success' as const, text: 'Disponible', icon: '🟢' },
    OCCUPIED: { variant: 'error' as const, text: 'Ocupada', icon: '🔴' },
    CLEANING: { variant: 'warning' as const, text: 'Limpieza', icon: '🟡' },
    MAINTENANCE: { variant: 'info' as const, text: 'Mantenimiento', icon: '🔵' },
    OUT_OF_ORDER: { variant: 'neutral' as const, text: 'Fuera de Servicio', icon: '⚫' }
  }

  const config = statusConfig[status]

  return (
    <StatusBadge 
      variant={config.variant} 
      className={className}
      icon={<span>{config.icon}</span>}
    >
      {config.text}
    </StatusBadge>
  )
}

// Badge para VIP
interface VipBadgeProps {
  isVip: boolean
  className?: string
}

export const VipBadge: React.FC<VipBadgeProps> = ({ isVip, className = '' }) => {
  if (!isVip) return null

  return (
    <StatusBadge 
      variant="primary" 
      size="sm" 
      className={className}
      icon={<span>👑</span>}
    >
      VIP
    </StatusBadge>
  )
}

// Badge para popularidad
interface PopularityBadgeProps {
  percentage: number
  className?: string
}

export const PopularityBadge: React.FC<PopularityBadgeProps> = ({ 
  percentage, 
  className = '' 
}) => {
  const getVariant = (percent: number): BadgeVariant => {
    if (percent >= 80) return 'success'
    if (percent >= 60) return 'warning'
    if (percent >= 40) return 'info'
    return 'neutral'
  }

  const getIcon = (percent: number) => {
    if (percent >= 80) return '🔥'
    if (percent >= 60) return '⭐'
    if (percent >= 40) return '📈'
    return '📊'
  }

  return (
    <StatusBadge 
      variant={getVariant(percentage)} 
      size="sm"
      className={className}
      icon={<span>{getIcon(percentage)}</span>}
    >
      {percentage}% popular
    </StatusBadge>
  )
}
