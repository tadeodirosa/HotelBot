import { apiClient } from './api'

// Tipos para Rooms
export interface Room {
  id: number
  number: string
  floor: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  roomTypeId: number
  notes?: string
  lastCleaned?: string
  lastMaintenance?: string
  createdAt: string
  updatedAt: string
  
  // Relaciones
  roomType?: {
    id: number
    name: string
    description: string
    capacity: number
    pricePerNight: number
    amenities: string[]
    images?: string[]
  }
  
  // Reserva actual si está ocupada
  currentReservation?: {
    id: number
    checkInDate: string
    checkOutDate: string
    customer: {
      firstName: string
      lastName: string
    }
  }
}

export interface CreateRoomDto {
  number: string
  floor: number
  roomTypeId: number
  notes?: string
}

export interface UpdateRoomDto {
  number?: string
  floor?: number
  roomTypeId?: number
  status?: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  notes?: string
}

export interface RoomFilters {
  status?: string
  floor?: number
  roomTypeId?: number
  available?: boolean
}

// Servicio de Rooms
export class RoomsService {
  private basePath = '/rooms'

  async getAll(filters?: RoomFilters): Promise<Room[]> {
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

    return apiClient.get<Room[]>(endpoint)
  }

  async getById(id: number): Promise<Room> {
    return apiClient.get<Room>(`${this.basePath}/${id}`)
  }

  async create(data: CreateRoomDto): Promise<Room> {
    return apiClient.post<Room>(this.basePath, data)
  }

  async update(id: number, data: UpdateRoomDto): Promise<Room> {
    return apiClient.patch<Room>(`${this.basePath}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  async updateStatus(id: number, status: Room['status']): Promise<Room> {
    return apiClient.patch<Room>(`${this.basePath}/${id}/status`, { status })
  }

  async markCleaned(id: number): Promise<Room> {
    return apiClient.patch<Room>(`${this.basePath}/${id}/cleaned`)
  }

  async scheduleMaintenance(id: number, date: string, notes?: string): Promise<Room> {
    return apiClient.patch<Room>(`${this.basePath}/${id}/maintenance`, { 
      date, 
      notes 
    })
  }

  async getByFloor(floor: number): Promise<Room[]> {
    return apiClient.get<Room[]>(`${this.basePath}/floor/${floor}`)
  }

  async getAvailable(checkIn: string, checkOut: string): Promise<Room[]> {
    return apiClient.get<Room[]>(
      `${this.basePath}/available?checkIn=${checkIn}&checkOut=${checkOut}`
    )
  }

  async getOccupancyMap(): Promise<{
    floors: Array<{
      floor: number
      rooms: Array<{
        id: number
        number: string
        status: Room['status']
        roomType: string
        currentGuest?: string
        checkOut?: string
      }>
    }>
    summary: {
      available: number
      occupied: number
      cleaning: number
      maintenance: number
      outOfOrder: number
    }
  }> {
    return apiClient.get<any>(`${this.basePath}/occupancy-map`)
  }

  async getStats(): Promise<{
    totalRooms: number
    occupancyRate: number
    averageRate: number
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    statusDistribution: {
      available: number
      occupied: number
      cleaning: number
      maintenance: number
      outOfOrder: number
    }
  }> {
    return apiClient.get<any>(`${this.basePath}/stats`)
  }
}

// Instancia singleton
export const roomsService = new RoomsService()
