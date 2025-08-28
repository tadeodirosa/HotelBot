import React, { useState, useCallback } from 'react'
import { reservationsService, type Reservation } from '../shared/services'
import { LoadingState, ErrorState, ReservationStatusBadge } from '../shared/components'
import { useApi, useFilters, usePagination } from '../shared/hooks'
import './reservations.css'

interface ReservationFilters {
  status?: string
  search?: string
  checkInFrom?: string
  checkInTo?: string
}

const ReservationsProfessional: React.FC = () => {
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

  // Formateo de datos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Handlers
  const handleSelectReservation = useCallback((reservationId: number) => {
    setSelectedReservations(prev => 
      prev.includes(reservationId)
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedReservations.length === (reservations?.length || 0)) {
      setSelectedReservations([])
    } else {
      setSelectedReservations(reservations?.map(r => r.id) || [])
    }
  }, [selectedReservations, reservations])

  const handleStatusChange = async (reservationId: number, newStatus: string) => {
    try {
      // Aquí implementarías la lógica para cambiar el estado
      console.log(`Changing reservation ${reservationId} to ${newStatus}`)
      await refetch()
    } catch (error) {
      console.error('Error changing status:', error)
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
          <div className="title-section">
            <h1 className="page-title">
              📋 Gestión de Reservas
            </h1>
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
            <button className="btn btn-primary">
              ➕ Nueva Reserva
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="search">Buscar:</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Código, cliente, habitación..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="status">Estado:</label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="select"
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
                <label htmlFor="checkInFrom">Desde:</label>
                <input
                  id="checkInFrom"
                  type="date"
                  value={filters.checkInFrom}
                  onChange={(e) => updateFilter('checkInFrom', e.target.value)}
                  className="input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="checkInTo">Hasta:</label>
                <input
                  id="checkInTo"
                  type="date"
                  value={filters.checkInTo}
                  onChange={(e) => updateFilter('checkInTo', e.target.value)}
                  className="input"
                />
              </div>

              <div className="filter-actions">
                <button 
                  onClick={resetFilters}
                  className="btn btn-outline"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones masivas */}
      {selectedReservations.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            {selectedReservations.length} reserva{selectedReservations.length !== 1 ? 's' : ''} seleccionada{selectedReservations.length !== 1 ? 's' : ''}
          </div>
          <div className="bulk-buttons">
            <button className="btn btn-outline">📧 Enviar Email</button>
            <button className="btn btn-outline">📄 Exportar</button>
            <button className="btn btn-danger">❌ Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabla de Reservas */}
      <div className="table-container">
        {filteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay reservas</h3>
            <p>No se encontraron reservas con los filtros aplicados.</p>
            <button 
              onClick={resetFilters}
              className="btn btn-primary"
            >
              Ver todas las reservas
            </button>
          </div>
        ) : (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedReservations.length === filteredReservations.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Código</th>
                <th>Cliente</th>
                <th>Habitación</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Huéspedes</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr 
                  key={reservation.id}
                  className={selectedReservations.includes(reservation.id) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReservations.includes(reservation.id)}
                      onChange={() => handleSelectReservation(reservation.id)}
                    />
                  </td>
                  <td className="reservation-code">
                    <div className="code-cell">
                      <span className="code-main">#{reservation.id}</span>
                      <span className="code-date">
                        {formatDate(reservation.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="customer-cell">
                    <div className="customer-info">
                      <span className="customer-name">
                        {reservation.customer?.firstName} {reservation.customer?.lastName}
                      </span>
                      <span className="customer-email">
                        {reservation.customer?.email}
                      </span>
                    </div>
                  </td>
                  <td className="room-cell">
                    <div className="room-info">
                      <span className="room-number">
                        Habitación {reservation.room?.number}
                      </span>
                      <span className="room-type">
                        {reservation.room?.roomType?.name}
                      </span>
                    </div>
                  </td>
                  <td className="date-cell">
                    {formatDate(reservation.checkInDate)}
                  </td>
                  <td className="date-cell">
                    {formatDate(reservation.checkOutDate)}
                  </td>
                  <td className="guests-cell">
                    <span className="guest-count">
                      👥 {reservation.adults}
                      {reservation.children > 0 && ` + ${reservation.children} niños`}
                    </span>
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
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        title="Ver detalles"
                        onClick={() => console.log('Ver', reservation.id)}
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Editar"
                        onClick={() => console.log('Editar', reservation.id)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Check-in"
                        onClick={() => handleStatusChange(reservation.id, 'CHECKED_IN')}
                        disabled={reservation.status !== 'CONFIRMED'}
                      >
                        🔑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  )
}

export default ReservationsProfessional
