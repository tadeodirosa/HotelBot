import React, { useState } from 'react'
import { useApi, useFilters, usePagination } from '../shared/hooks'
import { reservationsService, type Reservation } from '../shared/services'
import { LoadingState, ErrorState, ReservationStatusBadge } from '../shared/components'
import './reservations.css'

interface ReservationFilters {
  status?: string
  search?: string
  checkInFrom?: string
  checkInTo?: string
}

const ReservationsProfessional: React.FC = () => {
  console.log('ReservationsProfessional component mounted')
  
  // Estados para filtros y paginación
  const { filters, updateFilter, resetFilters } = useFilters<ReservationFilters>({
    status: '',
    search: '',
    checkInFrom: '',
    checkInTo: ''
  })

  const { 
    page, 
    pageSize, 
    updatePageSize,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage
  } = usePagination(1, 10)

  // API call con filtros
  const { 
    data: reservations, 
    loading, 
    error, 
    refetch 
  } = useApi<Reservation[]>(
    () => reservationsService.getAll(filters), 
    [filters, page, pageSize]
  )

  // Estados locales
  const [selectedReservations, setSelectedReservations] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados para modales
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  // Formateo de datos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  // Handlers para modales
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailsModal(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowEditModal(true)
  }

  const handleNewReservation = () => {
    setShowNewReservationModal(true)
  }

  const handleCloseModals = () => {
    setShowDetailsModal(false)
    setShowNewReservationModal(false)
    setShowEditModal(false)
    setSelectedReservation(null)
  }

  // Handlers para acciones
  const handleCheckIn = async (reservation: Reservation) => {
    try {
      console.log('Check-in para reserva:', reservation.id)
      // TODO: Llamar al API para cambiar estado
      // await reservationsService.updateStatus(reservation.id, 'CHECKED_IN')
      alert(`Check-in realizado para reserva #${reservation.id}`)
      refetch()
    } catch (error) {
      console.error('Error en check-in:', error)
      alert('Error al realizar check-in')
    }
  }

  const handleCheckOut = async (reservation: Reservation) => {
    try {
      console.log('Check-out para reserva:', reservation.id)
      // TODO: Llamar al API para cambiar estado
      alert(`Check-out realizado para reserva #${reservation.id}`)
      refetch()
    } catch (error) {
      console.error('Error en check-out:', error)
      alert('Error al realizar check-out')
    }
  }

  // Render loading state
  if (loading) {
    return <LoadingState message="Cargando reservas..." />
  }

  // Render error state
  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={refetch}
      />
    )
  }

  const filteredReservations = reservations || []
  const totalReservations = filteredReservations.length

  return (
    <div className="reservations-page">
      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-title">
            <h1 className="page-title">Gestión de Reservas</h1>
            <p className="page-subtitle">
              {totalReservations} reserva{totalReservations !== 1 ? 's' : ''} encontrada{totalReservations !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleNewReservation}
            >
              ➕ Nueva Reserva
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Buscar</label>
                <input 
                  type="text" 
                  placeholder="Cliente, habitación..." 
                  className="input"
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label>Estado</label>
                <select 
                  className="select"
                  value={filters.status || ''} 
                  onChange={(e) => updateFilter('status', e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="CHECKED_IN">Check-in</option>
                  <option value="CHECKED_OUT">Check-out</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Check-in desde</label>
                <input 
                  type="date" 
                  className="input"
                  value={filters.checkInFrom || ''}
                  onChange={(e) => updateFilter('checkInFrom', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <label>Check-in hasta</label>
                <input 
                  type="date" 
                  className="input"
                  value={filters.checkInTo || ''}
                  onChange={(e) => updateFilter('checkInTo', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filters-actions">
              <button 
                onClick={resetFilters}
                className="btn btn-outline"
              >
                🔄 Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Reservas */}
      <div className="table-section">
        {filteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay reservas para mostrar</h3>
            <p>Intenta ajustar los filtros o crear una nueva reserva</p>
            <button 
              onClick={resetFilters}
              className="btn btn-primary"
            >
              Ver todas las reservas
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Reserva</th>
                  <th>Cliente</th>
                  <th>Fechas</th>
                  <th>Habitación</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="reservation-cell">
                      <div className="reservation-info">
                        <span className="reservation-id">#{reservation.id}</span>
                        <span className="reservation-date">
                          {new Date(reservation.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-info">
                        <span className="customer-name">
                          {reservation.customer?.firstName} {reservation.customer?.lastName}
                        </span>
                        <span className="customer-contact">
                          {reservation.customer?.email}
                        </span>
                      </div>
                    </td>
                    <td className="dates-cell">
                      <div className="date-range">
                        <span className="check-in">
                          📅 {new Date(reservation.checkInDate).toLocaleDateString('es-AR')}
                        </span>
                        <span className="check-out">
                          📤 {new Date(reservation.checkOutDate).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </td>
                    <td className="room-cell">
                      <div className="room-info">
                        <span className="room-number">Hab. {reservation.room?.number}</span>
                        <span className="room-type">{reservation.room?.roomType?.name}</span>
                      </div>
                    </td>
                    <td className="status-cell">
                      <ReservationStatusBadge status={reservation.status} />
                    </td>
                    <td className="amount-cell">
                      <span className="amount">
                        {formatCurrency(reservation.totalAmount)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button 
                          className="btn-icon" 
                          title="Ver detalles"
                          onClick={() => handleViewDetails(reservation)}
                          style={{ 
                            padding: '0.375rem', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          👁️
                        </button>
                        
                        <button 
                          className="btn-icon" 
                          title="Editar"
                          onClick={() => handleEditReservation(reservation)}
                          style={{ 
                            padding: '0.375rem', 
                            backgroundColor: '#6b7280', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          ✏️
                        </button>

                        {/* Botón de Check-in más visible */}
                        {reservation.status === 'CONFIRMED' && (
                          <button 
                            title="Check-in"
                            onClick={() => handleCheckIn(reservation)}
                            style={{ 
                              padding: '0.375rem 0.75rem', 
                              backgroundColor: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            Check-in
                          </button>
                        )}

                        {/* Botón de Check-out */}
                        {reservation.status === 'CHECKED_IN' && (
                          <button 
                            title="Check-out"
                            onClick={() => handleCheckOut(reservation)}
                            style={{ 
                              padding: '0.375rem 0.75rem', 
                              backgroundColor: '#f59e0b', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            Check-out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {filteredReservations.length > 0 && (
        <div className="pagination-section">
          <div className="pagination-info">
            Mostrando {filteredReservations.length} de {totalReservations} reservas
          </div>
          
          <div className="pagination-controls">
            <button 
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              className="btn btn-outline"
            >
              ← Anterior
            </button>
            
            <span className="page-info">
              Página {page}
            </span>
            
            <button 
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className="btn btn-outline"
            >
              Siguiente →
            </button>
          </div>

          <div className="page-size-selector">
            <label htmlFor="pageSize">Mostrar:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => updatePageSize(Number(e.target.value))}
              className="select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>por página</span>
          </div>
        </div>
      )}

      {/* Modal de Detalles Mejorado */}
      {showDetailsModal && selectedReservation && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header del Modal */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                Detalles de Reserva #{selectedReservation.id}
              </h2>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Información del Cliente */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  👥 Información del Cliente
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Nombre</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>
                      {selectedReservation.customer?.firstName} {selectedReservation.customer?.lastName}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Email</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{selectedReservation.customer?.email}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Teléfono</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{selectedReservation.customer?.phone || 'No especificado'}</span>
                  </div>
                </div>
              </div>

              {/* Información de la Estadía */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  📅 Información de la Estadía
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Check-in</label>
                    <div>
                      <strong style={{ fontSize: '1.125rem', color: '#111827' }}>
                        {new Date(selectedReservation.checkInDate).toLocaleDateString('es-AR')}
                      </strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px', 
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}>
                      {Math.ceil((new Date(selectedReservation.checkOutDate).getTime() - new Date(selectedReservation.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} noches
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Check-out</label>
                    <div>
                      <strong style={{ fontSize: '1.125rem', color: '#111827' }}>
                        {new Date(selectedReservation.checkOutDate).toLocaleDateString('es-AR')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la Habitación */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  🏠 Información de la Habitación
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Número</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>Habitación {selectedReservation.room?.number}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Tipo</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{selectedReservation.room?.roomType?.name}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Huéspedes</label>
                    <span style={{ fontWeight: '500', color: '#111827' }}>
                      {selectedReservation.adults} adultos{selectedReservation.children > 0 && `, ${selectedReservation.children} niños`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y Total con Acciones */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Estado</label>
                    <ReservationStatusBadge status={selectedReservation.status} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', display: 'block' }}>Total</label>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                      {formatCurrency(selectedReservation.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción Rápida */}
                {selectedReservation.status !== 'CANCELLED' && selectedReservation.status !== 'CHECKED_OUT' && (
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      Acciones Rápidas
                    </h5>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {selectedReservation.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => {
                            handleCheckIn(selectedReservation)
                            setShowDetailsModal(false)
                          }}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          🔑 Realizar Check-in
                        </button>
                      )}
                      
                      {selectedReservation.status === 'CHECKED_IN' && (
                        <button 
                          onClick={() => {
                            handleCheckOut(selectedReservation)
                            setShowDetailsModal(false)
                          }}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#f59e0b', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          📤 Realizar Check-out
                        </button>
                      )}
                      
                      {(selectedReservation.status === 'PENDING' || selectedReservation.status === 'CONFIRMED') && (
                        <button 
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                              alert('Reserva cancelada (funcionalidad pendiente)')
                              setShowDetailsModal(false)
                            }
                          }}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                          }}
                        >
                          ❌ Cancelar Reserva
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div style={{ 
              padding: '1.5rem', 
              borderTop: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  setShowDetailsModal(false)
                  setShowEditModal(true)
                }}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Reserva Mejorado */}
      {showNewReservationModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header del Modal */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                ➕ Nueva Reserva
              </h2>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Fechas y Huéspedes */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  📅 Fechas y Huéspedes
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Check-in
                    </label>
                    <input 
                      type="date" 
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Check-out
                    </label>
                    <input 
                      type="date" 
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Adultos
                    </label>
                    <select style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <option value="1">1 adulto</option>
                      <option value="2">2 adultos</option>
                      <option value="3">3 adultos</option>
                      <option value="4">4 adultos</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Niños
                    </label>
                    <select style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <option value="0">0 niños</option>
                      <option value="1">1 niño</option>
                      <option value="2">2 niños</option>
                      <option value="3">3 niños</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  👥 Información del Cliente
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Nombre
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nombre del cliente"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Apellido
                    </label>
                    <input 
                      type="text" 
                      placeholder="Apellido del cliente"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Email
                    </label>
                    <input 
                      type="email" 
                      placeholder="cliente@email.com"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Teléfono
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+54 9 11 1234-5678"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Selección de Habitación */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  🏠 Selección de Habitación
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Tipo de Habitación
                    </label>
                    <select style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <option value="">Seleccionar tipo...</option>
                      <option value="1">Suite Familiar</option>
                      <option value="2">Habitación Doble</option>
                      <option value="3">Habitación Simple</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Habitación Específica
                    </label>
                    <select style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <option value="">Asignar automáticamente</option>
                      <option value="101">Habitación 101</option>
                      <option value="102">Habitación 102</option>
                      <option value="201">Habitación 201</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Plan de Comida
                    </label>
                    <select style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}>
                      <option value="">Solo hospedaje</option>
                      <option value="1">Desayuno incluido</option>
                      <option value="2">Media pensión</option>
                      <option value="3">Pensión completa</option>
                    </select>
                  </div>
                </div>

                {/* Resumen de Precio */}
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #bbf7d0', 
                  borderRadius: '8px'
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontWeight: '600' }}>Resumen de Precio</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Habitación (2 noches):</span>
                    <span>$200.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Plan de comida:</span>
                    <span>$50.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#166534', borderTop: '1px solid #bbf7d0', paddingTop: '0.5rem' }}>
                    <span>Total:</span>
                    <span>$250.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div style={{ 
              padding: '1.5rem', 
              borderTop: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button 
                style={{ 
                  padding: '0.5rem 1.5rem', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Crear Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && selectedReservation && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header del Modal */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                ✏️ Editar Reserva #{selectedReservation.id}
              </h2>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Estado de la Reserva */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  📋 Estado de la Reserva
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Estado Actual
                    </label>
                    <select 
                      defaultValue={selectedReservation.status}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="CONFIRMED">Confirmada</option>
                      <option value="CHECKED_IN">Check-in</option>
                      <option value="CHECKED_OUT">Check-out</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  📅 Fechas de la Estadía
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Check-in
                    </label>
                    <input 
                      type="date" 
                      defaultValue={selectedReservation.checkInDate.split('T')[0]}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Check-out
                    </label>
                    <input 
                      type="date" 
                      defaultValue={selectedReservation.checkOutDate.split('T')[0]}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  👥 Información del Cliente
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Nombre
                    </label>
                    <input 
                      type="text" 
                      defaultValue={selectedReservation.customer?.firstName}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Apellido
                    </label>
                    <input 
                      type="text" 
                      defaultValue={selectedReservation.customer?.lastName}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                      Email
                    </label>
                    <input 
                      type="email" 
                      defaultValue={selectedReservation.customer?.email}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div style={{ 
              padding: '1.5rem', 
              borderTop: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <button 
                onClick={handleCloseModals}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    alert('Guardado! (Funcionalidad pendiente)')
                    handleCloseModals()
                  }}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationsProfessional
