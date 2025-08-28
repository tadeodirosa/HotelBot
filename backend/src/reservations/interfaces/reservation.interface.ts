import { ReservationStatus, PaymentMethod, DiscountType } from './reservation.enums';

/**
 * Interface principal para una reserva
 */
export interface IReservation {
  id: number;
  reservationCode: string;
  customerId: number;
  roomId: number;
  mealPlanId?: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status: ReservationStatus;
  paymentMethod?: PaymentMethod;
  discountType?: DiscountType;
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relaciones
  customer?: ICustomer;
  room?: IRoom;
  mealPlan?: IMealPlan;
}

/**
 * Interface para búsqueda y filtrado de reservas
 */
export interface IReservationFilters {
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros por fechas
  checkInDateFrom?: Date;
  checkInDateTo?: Date;
  checkOutDateFrom?: Date;
  checkOutDateTo?: Date;
  
  // Filtros por entidades relacionadas
  customerId?: number;
  roomId?: number;
  roomTypeId?: number;
  mealPlanId?: number;
  
  // Filtros por estado y características
  status?: ReservationStatus;
  paymentMethod?: PaymentMethod;
  discountType?: DiscountType;
  
  // Filtros por rangos
  minAmount?: number;
  maxAmount?: number;
  minGuestCount?: number;
  maxGuestCount?: number;
  
  // Búsqueda por texto
  search?: string; // Búsqueda en código, nombre de cliente, etc.
  
  // Ordenamiento
  sortBy?: 'checkInDate' | 'checkOutDate' | 'totalAmount' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface para datos de disponibilidad
 */
export interface IAvailabilityRequest {
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  roomTypeId?: number;
}

/**
 * Interface para resultado de búsqueda de disponibilidad
 */
export interface IAvailabilityResult {
  available: boolean;
  availableRooms: IRoom[];
  totalRooms: number;
  message: string;
}

/**
 * Interface para cálculo de precios
 */
export interface IPriceCalculation {
  roomPrice: number;
  mealPlanPrice: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  nights: number;
  pricePerNight: number;
  breakdown: {
    roomTotal: number;
    mealPlanTotal: number;
    taxes?: number;
    fees?: number;
  };
}

/**
 * Interface para estadísticas de reservas
 */
export interface IReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  checkedInReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  averageStayDuration: number;
  occupancyRate: number;
}

/**
 * Interface para el repository de reservas
 */
export interface IReservationRepository {
  // CRUD básico
  create(data: any): Promise<IReservation>;
  findAll(filters?: IReservationFilters): Promise<{
    data: IReservation[];
    total: number;
    page: number;
    limit: number;
  }>;
  findById(id: number): Promise<IReservation | null>;
  findByCode(code: string): Promise<IReservation | null>;
  update(id: number, data: any): Promise<IReservation>;
  delete(id: number): Promise<void>;
  
  // Métodos específicos de reservas
  findOverlappingReservations(
    roomId: number, 
    checkIn: Date, 
    checkOut: Date,
    excludeReservationId?: number
  ): Promise<IReservation[]>;
  
  findAvailableRooms(
    checkIn: Date, 
    checkOut: Date, 
    guestCount: number,
    roomTypeId?: number
  ): Promise<IRoom[]>;
  
  findByCustomer(customerId: number): Promise<IReservation[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IReservation[]>;
  findByStatus(status: ReservationStatus): Promise<IReservation[]>;
  
  // Métodos de estadísticas
  getReservationStats(startDate?: Date, endDate?: Date): Promise<IReservationStats>;
  getOccupancyRate(date: Date): Promise<number>;
  
  // Métodos de validación
  isRoomAvailable(roomId: number, checkIn: Date, checkOut: Date): Promise<boolean>;
  isCodeUnique(code: string, excludeId?: number): Promise<boolean>;
}

// Interfaces de entidades relacionadas (simplificadas)
interface ICustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  dateOfBirth?: Date;
}

interface IRoom {
  id: number;
  name: string;
  roomTypeId: number;
  floor?: number;
  status: string;
  roomType: IRoomType;
}

interface IRoomType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

interface IMealPlan {
  id: number;
  name: string;
  description: string;
  type: string;
  dailyPrice: number;
  isActive: boolean;
}
