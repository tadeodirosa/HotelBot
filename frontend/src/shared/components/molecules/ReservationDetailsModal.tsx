import React from 'react'
import { type Reservation } from '../../services'
import './modals.css'

interface ReservationDetailsModalProps {
  reservation: Reservation | null
  isOpen: boolean
  onClose: () => void
  onEdit: (reservation: Reservation) => void
  onCheckIn: (reservation: Reservation) => void
  onCheckOut: (reservation: Reservation) => void
  onCancel: (reservation: Reservation) => void
}

export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onEdit,
  onCheckIn,
  onCheckOut,
  onCancel
}) => {
  if (!isOpen || !reservation) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#10b981'
      case 'PENDING': return '#f59e0b'
      case 'CHECKED_IN': return '#3b82f6'
      case 'CHECKED_OUT': return '#6366f1'
      case 'CANCELLED': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada'
      case 'PENDING': return 'Pendiente'
      case 'CHECKED_IN': return 'Check-in Realizado'
      case 'CHECKED_OUT': return 'Check-out Realizado'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }

  const canCheckIn = reservation.status === 'CONFIRMED'
  const canCheckOut = reservation.status === 'CHECKED_IN'
  const canEdit = ['PENDING', 'CONFIRMED'].includes(reservation.status)
  const canCancel = ['PENDING', 'CONFIRMED'].includes(reservation.status)

  // Calcular duración de estadía
  const checkIn = new Date(reservation.checkInDate)
  const checkOut = new Date(reservation.checkOutDate)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Detalles de Reserva</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Estado y Código */}
          <div className="detail-section">
            <div className="status-header">
              <div className="reservation-code">
                <h3>Reserva #{reservation.id}</h3>
                <span className="created-date">
                  Creada: {formatDateTime(reservation.createdAt)}
                </span>
              </div>
              <div 
                className="status-badge large"
                style={{ backgroundColor: getStatusColor(reservation.status) }}
              >
                {getStatusText(reservation.status)}
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="detail-section">
            <h4>👤 Cliente</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Nombre Completo:</label>
                <span>{reservation.customer?.firstName} {reservation.customer?.lastName}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{reservation.customer?.email}</span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span>{reservation.customer?.phone}</span>
              </div>
              <div className="detail-item">
                <label>Documento:</label>
                <span>{reservation.customer?.documentNumber}</span>
              </div>
            </div>
          </div>

          {/* Información de la Habitación */}
          <div className="detail-section">
            <h4>🏠 Habitación</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Número:</label>
                <span>Habitación {reservation.room?.number}</span>
              </div>
              <div className="detail-item">
                <label>Tipo:</label>
                <span>{reservation.room?.roomType?.name}</span>
              </div>
              <div className="detail-item">
                <label>Precio por Noche:</label>
                <span>{formatCurrency(reservation.room?.roomType?.pricePerNight || 0)}</span>
              </div>
            </div>
          </div>

          {/* Fechas de Estadía */}
          <div className="detail-section">
            <h4>📅 Estadía</h4>
            <div className="stay-info">
              <div className="date-range">
                <div className="date-item">
                  <label>Check-in:</label>
                  <div className="date-display">
                    <strong>{formatDate(reservation.checkInDate)}</strong>
                    <span className="date-time">15:00 hrs</span>
                  </div>
                </div>
                <div className="nights-count">
                  <span className="nights-badge">
                    {nights} noche{nights !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="date-item">
                  <label>Check-out:</label>
                  <div className="date-display">
                    <strong>{formatDate(reservation.checkOutDate)}</strong>
                    <span className="date-time">11:00 hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Huéspedes */}
          <div className="detail-section">
            <h4>👥 Huéspedes</h4>
            <div className="guest-info">
              <div className="guest-count">
                <span className="guest-badge adults">
                  👤 {reservation.adults} Adulto{reservation.adults !== 1 ? 's' : ''}
                </span>
                {reservation.children > 0 && (
                  <span className="guest-badge children">
                    🧒 {reservation.children} Niño{reservation.children !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Plan de Comida */}
          {reservation.mealPlan && (
            <div className="detail-section">
              <h4>🍽️ Plan de Comida</h4>
              <div className="meal-plan-info">
                <div className="meal-plan-name">{reservation.mealPlan.name}</div>
                <div className="meal-plan-price">
                  {formatCurrency(reservation.mealPlan.pricePerDay)} por día
                </div>
              </div>
            </div>
          )}

          {/* Resumen Financiero */}
          <div className="detail-section">
            <h4>💰 Resumen Financiero</h4>
            <div className="financial-summary">
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Habitación ({nights} noches):</span>
                  <span>{formatCurrency((reservation.room?.roomType?.pricePerNight || 0) * nights)}</span>
                </div>
                {reservation.mealPlan && (
                  <div className="cost-item">
                    <span>Plan de comida ({nights} días):</span>
                    <span>{formatCurrency(reservation.mealPlan.pricePerDay * nights)}</span>
                  </div>
                )}
              </div>
              <div className="total-amount">
                <strong>Total: {formatCurrency(reservation.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Notas */}
          {reservation.notes && (
            <div className="detail-section">
              <h4>📝 Notas</h4>
              <div className="notes-content">
                {reservation.notes}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="action-buttons">
            {canEdit && (
              <button 
                className="btn btn-primary"
                onClick={() => onEdit(reservation)}
              >
                ✏️ Editar Reserva
              </button>
            )}
            
            {canCheckIn && (
              <button 
                className="btn btn-success"
                onClick={() => onCheckIn(reservation)}
              >
                🔑 Check-in
              </button>
            )}
            
            {canCheckOut && (
              <button 
                className="btn btn-info"
                onClick={() => onCheckOut(reservation)}
              >
                📤 Check-out
              </button>
            )}
            
            {canCancel && (
              <button 
                className="btn btn-danger"
                onClick={() => onCancel(reservation)}
              >
                ❌ Cancelar
              </button>
            )}
            
            <button 
              className="btn btn-outline"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
