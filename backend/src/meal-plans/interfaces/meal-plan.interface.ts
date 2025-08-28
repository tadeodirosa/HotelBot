import { $Enums } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Use Prisma's enum directly to avoid conflicts
export type MealPlanType = $Enums.MealPlanType;

export interface IMealPlan {
  id: number;
  name: string;
  description: string;
  type: MealPlanType;
  dailyPrice: number; // Changed to number for API responses
  features: any; // JsonValue from Prisma
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMealPlanWithStats extends IMealPlan {
  totalReservations?: number;
  averageRevenue?: number;
  popularityRank?: number;
}

export interface MealPlanData {
  id: number;
  name: string;
  description: string;
  type: MealPlanType;
  dailyPrice: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalReservations?: number;
  averageRevenue?: number;
  popularityRank?: number;
}

export interface MealPlanResponse {
  success: boolean;
  message: string;
  data?: MealPlanData;
}

export interface MealPlanListResponse {
  success: boolean;
  message: string;
  data: MealPlanData[];
  total: number;
}

export interface MealPlanSearchResult {
  mealPlans: IMealPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MealPlanStats {
  totalMealPlans: number;
  totalActive: number;
  totalInactive: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  typeDistribution: Array<{
    type: MealPlanType;
    count: number;
    percentage: number;
  }>;
  popularityRanking: Array<{
    id: number;
    name: string;
    type: MealPlanType;
    reservationCount: number;
    revenue: number;
  }>;
}

export interface MealPlanPriceCalculation {
  baseDailyPrice: number;
  totalDays: number;
  totalPrice: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
    discountAmount: number;
  };
  finalPrice: number;
}

export interface MealPlanSearchDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: MealPlanType;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'type' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
