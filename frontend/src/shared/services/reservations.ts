import { apiClient } from './api'

// Tipos para Reservations
export interface Reservation {
  id: number
  customerId: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN' | 'CHECKED_OUT'
  notes?: string
  createdAt: string
  updatedAt: string
  
  // Relaciones
  customer?: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  room?: {
    id: number
    number: string
    roomType: {
      id: number
      name: string
      pricePerNight: number
    }
  }
  mealPlan?: {
    id: number
    name: string
    pricePerDay: number
  }
}

export interface CreateReservationDto {
  customerId: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  mealPlanId?: number
  notes?: string
}

export interface UpdateReservationDto {
  customerId?: number
  roomId?: number
  checkInDate?: string
  checkOutDate?: string
  adults?: number
  children?: number
  mealPlanId?: number
  notes?: string
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN' | 'CHECKED_OUT'
}

export interface ReservationFilters {
  status?: string
  customerId?: number
  roomId?: number
  checkInFrom?: string
  checkInTo?: string
  checkOutFrom?: string
  checkOutTo?: string
}

// Servicio de Reservations
export class ReservationsService {
  private basePath = '/reservations'

  async getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath

    return apiClient.get<Reservation[]>(endpoint)
  }

  async getById(id: number): Promise<Reservation> {
    return apiClient.get<Reservation>(`${this.basePath}/${id}`)
  }

  async create(data: CreateReservationDto): Promise<Reservation> {
    return apiClient.post<Reservation>(this.basePath, data)
  }

  async update(id: number, data: UpdateReservationDto): Promise<Reservation> {
    return apiClient.patch<Reservation>(`${this.basePath}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  async checkIn(id: number): Promise<Reservation> {
    return apiClient.patch<Reservation>(`${this.basePath}/${id}/check-in`)
  }

  async checkOut(id: number): Promise<Reservation> {
    return apiClient.patch<Reservation>(`${this.basePath}/${id}/check-out`)
  }

  async cancel(id: number, reason?: string): Promise<Reservation> {
    return apiClient.patch<Reservation>(`${this.basePath}/${id}/cancel`, { reason })
  }

  async confirm(id: number): Promise<Reservation> {
    return apiClient.patch<Reservation>(`${this.basePath}/${id}/confirm`)
  }

  // Obtener estadísticas de reservas
  async getStats(): Promise<{
    total: number
    pending: number
    confirmed: number
    checkedIn: number
    completed: number
    cancelled: number
    totalRevenue: number
    occupancyRate: number
  }> {
    return apiClient.get<any>(`${this.basePath}/stats`)
  }

  // Verificar disponibilidad
  async checkAvailability(
    roomTypeId: number,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; rooms: any[] }> {
    return apiClient.get<any>(
      `/rooms/availability?roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}`
    )
  }
}

// Instancia singleton
export const reservationsService = new ReservationsService()
