import { Customer } from '@prisma/client';

export interface ICustomer extends Customer {
  fullName?: string;
  age?: number;
}

export interface ICustomerWithReservations extends ICustomer {
  reservations?: {
    id: number;
    checkIn: Date;
    checkOut: Date;
    status: string;
    totalAmount: number;
  }[];
  totalReservations?: number;
  totalSpent?: number;
}

export interface ICustomerSearchFilters {
  name?: string;
  dni?: string;
  email?: string;
  nationality?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerSearchResult {
  customers: ICustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICustomerPreferences {
  roomPreferences?: {
    floor?: 'low' | 'middle' | 'high';
    view?: 'sea' | 'mountain' | 'city' | 'garden';
    bedType?: 'single' | 'double' | 'queen' | 'king';
    smoking?: boolean;
  };
  dietaryRestrictions?: string[];
  communicationLanguage?: string;
  specialRequests?: string[];
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ICustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topNationalities: {
    nationality: string;
    count: number;
  }[];
  averageAge: number;
  loyaltyDistribution: {
    tier: string;
    count: number;
  }[];
}
