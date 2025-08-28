import { apiClient } from './api'

// Tipos para Room Types
export interface RoomType {
  id: number
  name: string
  description: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  images?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  
  // Estadísticas
  roomCount?: number
  availableRooms?: number
  occupancyRate?: number
}

export interface CreateRoomTypeDto {
  name: string
  description: string
  capacity: number
  pricePerNight: number
  amenities: string[]
  images?: string[]
}

export interface UpdateRoomTypeDto {
  name?: string
  description?: string
  capacity?: number
  pricePerNight?: number
  amenities?: string[]
  images?: string[]
  isActive?: boolean
}

// Servicio de Room Types
export class RoomTypesService {
  private basePath = '/room-types'

  async getAll(): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(this.basePath)
  }

  async getActive(): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(`${this.basePath}?active=true`)
  }

  async getById(id: number): Promise<RoomType> {
    return apiClient.get<RoomType>(`${this.basePath}/${id}`)
  }

  async create(data: CreateRoomTypeDto): Promise<RoomType> {
    return apiClient.post<RoomType>(this.basePath, data)
  }

  async update(id: number, data: UpdateRoomTypeDto): Promise<RoomType> {
    return apiClient.patch<RoomType>(`${this.basePath}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  async activate(id: number): Promise<RoomType> {
    return apiClient.patch<RoomType>(`${this.basePath}/${id}/activate`)
  }

  async deactivate(id: number): Promise<RoomType> {
    return apiClient.patch<RoomType>(`${this.basePath}/${id}/deactivate`)
  }

  async updatePricing(id: number, pricePerNight: number): Promise<RoomType> {
    return apiClient.patch<RoomType>(`${this.basePath}/${id}/pricing`, { 
      pricePerNight 
    })
  }

  async getStats(id: number): Promise<{
    totalRooms: number
    availableRooms: number
    occupiedRooms: number
    occupancyRate: number
    averagePrice: number
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    popularAmenities: Array<{
      amenity: string
      popularity: number
    }>
  }> {
    return apiClient.get<any>(`${this.basePath}/${id}/stats`)
  }

  async uploadImage(id: number, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append('image', file)

    // Para upload de archivos, necesitamos usar fetch directamente
    const response = await fetch(`${apiClient['baseURL']}${this.basePath}/${id}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Error al subir imagen')
    }

    return response.json()
  }

  async removeImage(id: number, imageUrl: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/${id}/remove-image`, { imageUrl })
  }
}

// Instancia singleton
export const roomTypesService = new RoomTypesService()
