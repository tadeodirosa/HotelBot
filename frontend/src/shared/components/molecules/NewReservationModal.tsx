import React, { useState, useEffect } from 'react'
import { customersService, roomsService, roomTypesService, mealPlansService, reservationsService } from '../../services'
import { useApiMutation, useApi } from '../../hooks'
import type { Customer, Room, RoomType, MealPlan, CreateReservationDto } from '../../services'
import './modals.css'

interface NewReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ReservationFormData {
  // Paso 1: Fechas y huéspedes
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  
  // Paso 2: Cliente
  customerId: number | null
  newCustomer?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    documentType: 'DNI' | 'PASSPORT' | 'OTHER'
    documentNumber: string
    nationality: string
  }
  
  // Paso 3: Habitación
  roomTypeId: number | null
  roomId: number | null
  
  // Paso 4: Extras
  mealPlanId: number | null
  notes: string
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ReservationFormData>({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    customerId: null,
    roomTypeId: null,
    roomId: null,
    mealPlanId: null,
    notes: ''
  })

  // Estados para búsquedas
  const [customerSearch, setCustomerSearch] = useState('')
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)

  // API calls
  const { data: customers } = useApi<Customer[]>(
    () => customersService.search(customerSearch),
    [customerSearch]
  )

  const { data: roomTypes } = useApi<RoomType[]>(
    () => roomTypesService.getActive(),
    []
  )

  const { data: mealPlans } = useApi<MealPlan[]>(
    () => mealPlansService.getActive(),
    []
  )

  const { mutate: createReservation, loading: creating } = useApiMutation<any, CreateReservationDto>()

  // Buscar habitaciones disponibles cuando cambian las fechas o tipo
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && formData.roomTypeId) {
      loadAvailableRooms()
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomTypeId])

  const loadAvailableRooms = async () => {
    try {
      const rooms = await roomsService.getAvailable(formData.checkInDate, formData.checkOutDate)
      const filteredRooms = rooms.filter(room => room.roomTypeId === formData.roomTypeId)
      setAvailableRooms(filteredRooms)
    } catch (error) {
      console.error('Error loading available rooms:', error)
      setAvailableRooms([])
    }
  }

  const updateFormData = (updates: Partial<ReservationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.checkInDate || !formData.checkOutDate) {
          alert('Por favor selecciona las fechas de check-in y check-out')
          return false
        }
        if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
          alert('La fecha de check-out debe ser posterior a la de check-in')
          return false
        }
        if (formData.adults < 1) {
          alert('Debe haber al menos 1 adulto')
          return false
        }
        return true
      
      case 2:
        if (!formData.customerId && !showNewCustomerForm) {
          alert('Por favor selecciona un cliente o crea uno nuevo')
          return false
        }
        if (showNewCustomerForm && !formData.newCustomer?.firstName) {
          alert('Por favor completa los datos del nuevo cliente')
          return false
        }
        return true
      
      case 3:
        if (!formData.roomId) {
          alert('Por favor selecciona una habitación')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    try {
      let customerId = formData.customerId

      // Si es un cliente nuevo, crearlo primero
      if (showNewCustomerForm && formData.newCustomer) {
        const newCustomer = await customersService.create(formData.newCustomer)
        customerId = newCustomer.id
      }

      if (!customerId || !formData.roomId) {
        alert('Datos incompletos')
        return
      }

      const reservationData: CreateReservationDto = {
        customerId,
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        adults: formData.adults,
        children: formData.children,
        mealPlanId: formData.mealPlanId || undefined,
        notes: formData.notes || undefined
      }

      const mutation = await createReservation((data) => reservationsService.create(data))
      await mutation(reservationData)
      
      alert('Reserva creada exitosamente!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error al crear la reserva. Por favor intenta nuevamente.')
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      checkInDate: '',
      checkOutDate: '',
      adults: 1,
      children: 0,
      customerId: null,
      roomTypeId: null,
      roomId: null,
      mealPlanId: null,
      notes: ''
    })
    setShowNewCustomerForm(false)
    setCustomerSearch('')
  }

  if (!isOpen) return null

  const renderStep1 = () => (
    <div className="form-step">
      <h3>📅 Fechas y Huéspedes</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="checkInDate">Fecha de Check-in *</label>
          <input
            id="checkInDate"
            type="date"
            value={formData.checkInDate}
            onChange={(e) => updateFormData({ checkInDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOutDate">Fecha de Check-out *</label>
          <input
            id="checkOutDate"
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => updateFormData({ checkOutDate: e.target.value })}
            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adults">Adultos *</label>
          <select
            id="adults"
            value={formData.adults}
            onChange={(e) => updateFormData({ adults: Number(e.target.value) })}
            className="select"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="children">Niños</label>
          <select
            id="children"
            value={formData.children}
            onChange={(e) => updateFormData({ children: Number(e.target.value) })}
            className="select"
          >
            {[0, 1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      {formData.checkInDate && formData.checkOutDate && (
        <div className="stay-summary">
          <strong>
            Estadía: {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} noche(s)
          </strong>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="form-step">
      <h3>👤 Seleccionar Cliente</h3>
      
      <div className="customer-selection">
        <div className="form-group">
          <label htmlFor="customerSearch">Buscar Cliente Existente</label>
          <input
            id="customerSearch"
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="input"
          />
        </div>

        {customers && customers.length > 0 && (
          <div className="customer-list">
            <h4>Clientes Encontrados:</h4>
            {customers.map(customer => (
              <div 
                key={customer.id}
                className={`customer-item ${formData.customerId === customer.id ? 'selected' : ''}`}
                onClick={() => updateFormData({ customerId: customer.id })}
              >
                <div className="customer-info">
                  <strong>{customer.firstName} {customer.lastName}</strong>
                  <span>{customer.email}</span>
                  <span>{customer.phone}</span>
                </div>
                <div className="customer-select">
                  {formData.customerId === customer.id ? '✓' : 'Seleccionar'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="divider">
          <span>O</span>
        </div>

        <button
          type="button"
          onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
          className="btn btn-outline"
        >
          {showNewCustomerForm ? '❌ Cancelar' : '➕ Crear Nuevo Cliente'}
        </button>

        {showNewCustomerForm && (
          <div className="new-customer-form">
            <h4>Datos del Nuevo Cliente</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.newCustomer?.firstName || ''}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, firstName: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  value={formData.newCustomer?.lastName || ''}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, lastName: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.newCustomer?.email || ''}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, email: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={formData.newCustomer?.phone || ''}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, phone: e.target.value }
                  })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo de Documento</label>
                <select
                  value={formData.newCustomer?.documentType || 'DNI'}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, documentType: e.target.value as any }
                  })}
                  className="select"
                >
                  <option value="DNI">DNI</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número de Documento</label>
                <input
                  type="text"
                  value={formData.newCustomer?.documentNumber || ''}
                  onChange={(e) => updateFormData({
                    newCustomer: { ...formData.newCustomer!, documentNumber: e.target.value }
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="form-step">
      <h3>🏠 Seleccionar Habitación</h3>
      
      <div className="form-group">
        <label htmlFor="roomType">Tipo de Habitación *</label>
        <select
          id="roomType"
          value={formData.roomTypeId || ''}
          onChange={(e) => updateFormData({ 
            roomTypeId: Number(e.target.value) || null,
            roomId: null // Reset room selection when type changes
          })}
          className="select"
        >
          <option value="">Seleccionar tipo...</option>
          {roomTypes?.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - ${type.pricePerNight}/noche (Capacidad: {type.capacity})
            </option>
          ))}
        </select>
      </div>

      {formData.roomTypeId && (
        <div className="available-rooms">
          <h4>Habitaciones Disponibles:</h4>
          {availableRooms.length === 0 ? (
            <p>No hay habitaciones disponibles para las fechas seleccionadas.</p>
          ) : (
            <div className="rooms-grid">
              {availableRooms.map(room => (
                <div
                  key={room.id}
                  className={`room-card ${formData.roomId === room.id ? 'selected' : ''}`}
                  onClick={() => updateFormData({ roomId: room.id })}
                >
                  <div className="room-number">Habitación {room.number}</div>
                  <div className="room-type">{room.roomType?.name}</div>
                  <div className="room-price">${room.roomType?.pricePerNight}/noche</div>
                  <div className="room-status">✅ Disponible</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="form-step">
      <h3>🍽️ Extras y Confirmación</h3>
      
      <div className="form-group">
        <label htmlFor="mealPlan">Plan de Comida (Opcional)</label>
        <select
          id="mealPlan"
          value={formData.mealPlanId || ''}
          onChange={(e) => updateFormData({ mealPlanId: Number(e.target.value) || null })}
          className="select"
        >
          <option value="">Sin plan de comida</option>
          {mealPlans?.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ${plan.pricePerDay}/día
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notas Adicionales</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          className="textarea"
          rows={4}
          placeholder="Preferencias especiales, solicitudes, etc..."
        />
      </div>

      {/* Resumen de la reserva */}
      <div className="reservation-summary">
        <h4>📋 Resumen de la Reserva</h4>
        <div className="summary-details">
          <div className="summary-item">
            <span>Cliente:</span>
            <span>
              {showNewCustomerForm 
                ? `${formData.newCustomer?.firstName} ${formData.newCustomer?.lastName}`
                : customers?.find(c => c.id === formData.customerId)?.firstName + ' ' + 
                  customers?.find(c => c.id === formData.customerId)?.lastName
              }
            </span>
          </div>
          <div className="summary-item">
            <span>Fechas:</span>
            <span>{formData.checkInDate} al {formData.checkOutDate}</span>
          </div>
          <div className="summary-item">
            <span>Habitación:</span>
            <span>
              {availableRooms.find(r => r.id === formData.roomId)?.number} - {' '}
              {roomTypes?.find(t => t.id === formData.roomTypeId)?.name}
            </span>
          </div>
          <div className="summary-item">
            <span>Huéspedes:</span>
            <span>{formData.adults} adulto(s) {formData.children > 0 && `+ ${formData.children} niño(s)`}</span>
          </div>
          {formData.mealPlanId && (
            <div className="summary-item">
              <span>Plan de comida:</span>
              <span>{mealPlans?.find(p => p.id === formData.mealPlanId)?.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Nueva Reserva</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Indicador de pasos */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step}
              className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 && 'Fechas'}
                {step === 2 && 'Cliente'}
                {step === 3 && 'Habitación'}
                {step === 4 && 'Confirmación'}
              </span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            {currentStep > 1 && (
              <button 
                type="button"
                onClick={prevStep}
                className="btn btn-outline"
              >
                ← Anterior
              </button>
            )}

            <button 
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>

            {currentStep < 4 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Siguiente →
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={creating}
                className="btn btn-success"
              >
                {creating ? 'Creando...' : '✅ Crear Reserva'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
