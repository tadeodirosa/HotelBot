import { apiClient } from './api'

// Tipos para Customers
export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: 'DNI' | 'PASSPORT' | 'OTHER'
  documentNumber: string
  nationality: string
  dateOfBirth?: string
  address?: string
  city?: string
  country?: string
  isVip: boolean
  preferences?: {
    roomPreference?: string
    dietaryRestrictions?: string
    language?: string
  }
  createdAt: string
  updatedAt: string
  
  // Estadísticas
  totalReservations?: number
  totalSpent?: number
  lastVisit?: string
}

export interface CreateCustomerDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: 'DNI' | 'PASSPORT' | 'OTHER'
  documentNumber: string
  nationality: string
  dateOfBirth?: string
  address?: string
  city?: string
  country?: string
  isVip?: boolean
  preferences?: {
    roomPreference?: string
    dietaryRestrictions?: string
    language?: string
  }
}

export interface UpdateCustomerDto {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  documentType?: 'DNI' | 'PASSPORT' | 'OTHER'
  documentNumber?: string
  nationality?: string
  dateOfBirth?: string
  address?: string
  city?: string
  country?: string
  isVip?: boolean
  preferences?: {
    roomPreference?: string
    dietaryRestrictions?: string
    language?: string
  }
}

export interface CustomerFilters {
  search?: string
  nationality?: string
  isVip?: boolean
  country?: string
}

// Servicio de Customers
export class CustomersService {
  private basePath = '/customers'

  async getAll(filters?: CustomerFilters): Promise<Customer[]> {
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

    return apiClient.get<Customer[]>(endpoint)
  }

  async getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`${this.basePath}/${id}`)
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    return apiClient.post<Customer>(this.basePath, data)
  }

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    return apiClient.patch<Customer>(`${this.basePath}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  async search(query: string): Promise<Customer[]> {
    return apiClient.get<Customer[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`)
  }

  async getReservations(customerId: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${customerId}/reservations`)
  }

  async getStats(customerId: number): Promise<{
    totalReservations: number
    totalSpent: number
    averageStay: number
    lastVisit: string
    favoriteRoomType: string
  }> {
    return apiClient.get<any>(`${this.basePath}/${customerId}/stats`)
  }

  // Exportar lista de clientes
  async exportToExcel(filters?: CustomerFilters): Promise<Blob> {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = queryParams.toString() 
      ? `${this.basePath}/export?${queryParams.toString()}`
      : `${this.basePath}/export`

    const response = await fetch(`${apiClient['baseURL']}${endpoint}`, {
      headers: apiClient['getHeaders'](),
    })

    if (!response.ok) {
      throw new Error('Error al exportar clientes')
    }

    return response.blob()
  }
}

// Instancia singleton
export const customersService = new CustomersService()
