import { apiClient } from './api'

// Tipos para Meal Plans
export interface MealPlan {
  id: number
  name: string
  description: string
  pricePerDay: number
  isActive: boolean
  inclusions: string[]
  restrictions?: string[]
  dietaryOptions: Array<{
    type: 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'KETO' | 'DIABETIC'
    available: boolean
  }>
  createdAt: string
  updatedAt: string
  
  // Estadísticas
  popularityRate?: number
  activeReservations?: number
  monthlyRevenue?: number
}

export interface CreateMealPlanDto {
  name: string
  description: string
  pricePerDay: number
  inclusions: string[]
  restrictions?: string[]
  dietaryOptions: Array<{
    type: 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'KETO' | 'DIABETIC'
    available: boolean
  }>
}

export interface UpdateMealPlanDto {
  name?: string
  description?: string
  pricePerDay?: number
  inclusions?: string[]
  restrictions?: string[]
  dietaryOptions?: Array<{
    type: 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'KETO' | 'DIABETIC'
    available: boolean
  }>
  isActive?: boolean
}

export interface MealPlanFilters {
  active?: boolean
  priceRange?: {
    min: number
    max: number
  }
  dietaryType?: string
}

// Servicio de Meal Plans
export class MealPlansService {
  private basePath = '/meal-plans'

  async getAll(filters?: MealPlanFilters): Promise<MealPlan[]> {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'priceRange' && typeof value === 'object') {
            queryParams.append('minPrice', value.min.toString())
            queryParams.append('maxPrice', value.max.toString())
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })
    }

    const endpoint = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath

    return apiClient.get<MealPlan[]>(endpoint)
  }

  async getActive(): Promise<MealPlan[]> {
    return apiClient.get<MealPlan[]>(`${this.basePath}?active=true`)
  }

  async getById(id: number): Promise<MealPlan> {
    return apiClient.get<MealPlan>(`${this.basePath}/${id}`)
  }

  async create(data: CreateMealPlanDto): Promise<MealPlan> {
    return apiClient.post<MealPlan>(this.basePath, data)
  }

  async update(id: number, data: UpdateMealPlanDto): Promise<MealPlan> {
    return apiClient.patch<MealPlan>(`${this.basePath}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`)
  }

  async activate(id: number): Promise<MealPlan> {
    return apiClient.patch<MealPlan>(`${this.basePath}/${id}/activate`)
  }

  async deactivate(id: number): Promise<MealPlan> {
    return apiClient.patch<MealPlan>(`${this.basePath}/${id}/deactivate`)
  }

  async updatePricing(id: number, pricePerDay: number): Promise<MealPlan> {
    return apiClient.patch<MealPlan>(`${this.basePath}/${id}/pricing`, { 
      pricePerDay 
    })
  }

  async getStats(id: number): Promise<{
    activeReservations: number
    totalReservations: number
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
      thisYear: number
    }
    popularityRate: number
    averageRating?: number
    dietaryBreakdown: Array<{
      type: string
      count: number
      percentage: number
    }>
  }> {
    return apiClient.get<any>(`${this.basePath}/${id}/stats`)
  }

  async getPopularityReport(): Promise<Array<{
    id: number
    name: string
    reservations: number
    revenue: number
    popularity: number
    trend: 'up' | 'down' | 'stable'
  }>> {
    return apiClient.get<any>(`${this.basePath}/popularity-report`)
  }

  async getMenuSuggestions(planId: number, date: string): Promise<{
    breakfast: Array<{ name: string; description: string }>
    lunch: Array<{ name: string; description: string }>
    dinner: Array<{ name: string; description: string }>
    snacks: Array<{ name: string; description: string }>
  }> {
    return apiClient.get<any>(`${this.basePath}/${planId}/menu-suggestions?date=${date}`)
  }
}

// Instancia singleton
export const mealPlansService = new MealPlansService()
