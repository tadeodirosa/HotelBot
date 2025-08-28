import { 
  Injectable, 
  BadRequestException, 
  ConflictException, 
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from '../config/prisma.service';
import { 
  CreateReservationDto, 
  UpdateReservationDto, 
  ChangeReservationStatusDto,
  CheckAvailabilityDto,
  ReservationSearchDto,
  CalculateReservationPriceDto
} from './dto/reservation.dto';
import { 
  IReservation, 
  IReservationFilters, 
  IAvailabilityResult,
  IPriceCalculation
} from './interfaces/reservation.interface';
import { ReservationStatus } from './interfaces/reservation.enums';
import { DateValidationUtils } from './validators/date.validators';
import { ApiResponse } from '../shared/interfaces/api-response.interface';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly repository: ReservationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Crear una nueva reserva con validaciones exhaustivas
   */
  async create(dto: CreateReservationDto): Promise<ApiResponse<IReservation>> {
    try {
      // 1. Validar código de reserva único
      await this.validateUniqueReservationCode(dto.reservationCode);
      
      // 2. Validar disponibilidad de habitación
      await this.validateRoomAvailability(
        dto.roomId, 
        new Date(dto.checkInDate), 
        new Date(dto.checkOutDate)
      );
      
      // 3. Validar capacidad vs huéspedes
      await this.validateRoomCapacity(dto.roomId, dto.guestCount);
      
      // 4. Validar cliente y edad (mayor de 18 años para titular)
      await this.validateCustomerEligibility(dto.customerId);
      
      // 5. Validar meal plan si existe
      if (dto.mealPlanId) {
        await this.validateMealPlan(dto.mealPlanId);
      }

      // 6. Validar fechas de reserva
      this.validateReservationDates(dto.checkInDate, dto.checkOutDate);

      // 7. Crear la reserva
      const reservation = await this.repository.create(dto);

      return {
        success: true,
        data: reservation,
        message: 'Reserva creada exitosamente',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al crear reserva');
    }
  }

  /**
   * Obtener todas las reservas con filtros
   */
  async findAll(searchDto: ReservationSearchDto): Promise<ApiResponse<{
    data: IReservation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    try {
      const filters: IReservationFilters = {
        page: searchDto.page,
        limit: searchDto.limit,
        search: searchDto.search,
        status: searchDto.status,
        customerId: searchDto.customerId,
        roomId: searchDto.roomId,
        checkInDateFrom: searchDto.checkInDateFrom ? new Date(searchDto.checkInDateFrom) : undefined,
        checkInDateTo: searchDto.checkInDateTo ? new Date(searchDto.checkInDateTo) : undefined,
        sortBy: searchDto.sortBy,
        sortOrder: searchDto.sortOrder,
      };

      const result = await this.repository.findAll(filters);
      const totalPages = Math.ceil(result.total / result.limit);

      return {
        success: true,
        data: {
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages,
          },
        },
        message: `${result.total} reservas encontradas`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error interno del servidor al obtener reservas');
    }
  }

  /**
   * Obtener reserva por ID
   */
  async findOne(id: number): Promise<ApiResponse<IReservation>> {
    try {
      const reservation = await this.repository.findById(id);
      
      if (!reservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      return {
        success: true,
        data: reservation,
        message: 'Reserva obtenida exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al obtener reserva');
    }
  }

  /**
   * Obtener reserva por código
   */
  async findByCode(code: string): Promise<ApiResponse<IReservation>> {
    try {
      const reservation = await this.repository.findByCode(code);
      
      if (!reservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      return {
        success: true,
        data: reservation,
        message: 'Reserva obtenida exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al obtener reserva');
    }
  }

  /**
   * MÉTODO CRÍTICO: Verificar disponibilidad específica de habitación
   */
  async checkRoomAvailability(
    roomId: number,
    checkInDate: string, 
    checkOutDate: string
  ): Promise<ApiResponse<{
    available: boolean;
    roomDetails?: any;
    conflictingReservations?: any[];
    message: string;
  }>> {
    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      // Validar fechas
      this.validateReservationDates(checkInDate, checkOutDate);
      
      // Obtener información de la habitación
      const room = await this.getRoomWithPricing(roomId);
      
      // Buscar reservas solapadas
      const overlapping = await this.repository.findOverlappingReservations(roomId, checkIn, checkOut);
      const isAvailable = overlapping.length === 0 && room.status === 'AVAILABLE';
      
      return {
        success: true,
        data: {
          available: isAvailable,
          roomDetails: room,
          conflictingReservations: isAvailable ? [] : overlapping,
          message: isAvailable 
            ? 'Habitación disponible en las fechas seleccionadas'
            : `Habitación no disponible. ${overlapping.length} reservas conflictivas encontradas`,
        },
        message: isAvailable ? 'Disponibilidad confirmada' : 'Habitación no disponible',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al verificar disponibilidad');
    }
  }

  /**
   * MÉTODO CRÍTICO: Buscar habitaciones disponibles
   */
  async findAvailableRooms(dto: CheckAvailabilityDto): Promise<ApiResponse<{
    availableRooms: any[];
    totalAvailable: number;
    searchCriteria: any;
  }>> {
    try {
      const checkIn = new Date(dto.checkInDate);
      const checkOut = new Date(dto.checkOutDate);
      
      // Validar fechas
      this.validateReservationDates(dto.checkInDate, dto.checkOutDate);
      
      // Buscar habitaciones disponibles
      const availableRooms = await this.repository.findAvailableRooms(
        checkIn, 
        checkOut, 
        dto.guestCount,
        dto.roomTypeId
      );
      
      return {
        success: true,
        data: {
          availableRooms,
          totalAvailable: availableRooms.length,
          searchCriteria: {
            checkInDate: dto.checkInDate,
            checkOutDate: dto.checkOutDate,
            guestCount: dto.guestCount,
            roomTypeId: dto.roomTypeId,
            nights: DateValidationUtils.calculateNights(checkIn, checkOut),
          },
        },
        message: `${availableRooms.length} habitaciones disponibles encontradas`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al buscar habitaciones');
    }
  }

  /**
   * Calcular precio de reserva
   */
  async calculatePrice(dto: CalculateReservationPriceDto): Promise<ApiResponse<IPriceCalculation>> {
    try {
      const checkIn = new Date(dto.checkInDate);
      const checkOut = new Date(dto.checkOutDate);
      const nights = DateValidationUtils.calculateNights(checkIn, checkOut);

      // Validar fechas
      this.validateReservationDates(dto.checkInDate, dto.checkOutDate);

      // Obtener información de la habitación
      const room = await this.getRoomWithPricing(dto.roomId);
      const roomPrice = room.roomType.basePrice;
      const roomTotal = roomPrice * nights;

      // Obtener información del meal plan si existe
      let mealPlanPrice = 0;
      let mealPlanTotal = 0;
      
      if (dto.mealPlanId) {
        const mealPlan = await this.getMealPlanWithPricing(dto.mealPlanId);
        mealPlanPrice = mealPlan.dailyPrice;
        mealPlanTotal = mealPlanPrice * nights;
      }

      const subtotal = roomTotal + mealPlanTotal;
      const discountAmount = this.calculateDiscountAmount(subtotal, dto.discountType, nights);
      const totalAmount = subtotal - discountAmount;

      const priceCalculation: IPriceCalculation = {
        roomPrice,
        mealPlanPrice,
        subtotal,
        discountAmount,
        totalAmount,
        nights,
        pricePerNight: subtotal / nights,
        breakdown: {
          roomTotal,
          mealPlanTotal,
          taxes: 0, // No implementado aún
          fees: 0,  // No implementado aún
        },
      };

      return {
        success: true,
        data: priceCalculation,
        message: 'Precio calculado exitosamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al calcular precio');
    }
  }

  /**
   * Actualizar reserva
   */
  async update(id: number, dto: UpdateReservationDto): Promise<ApiResponse<IReservation>> {
    try {
      // Verificar que la reserva existe
      const existingReservation = await this.repository.findById(id);
      if (!existingReservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Validar código único si se está actualizando
      if (dto.reservationCode) {
        const codeExists = await this.repository.isCodeUnique(dto.reservationCode, id);
        if (!codeExists) {
          throw new ConflictException('El código de reserva ya existe');
        }
      }

      // Validar disponibilidad si se están cambiando las fechas
      if (dto.checkInDate || dto.checkOutDate) {
        const checkIn = dto.checkInDate ? new Date(dto.checkInDate) : existingReservation.checkInDate;
        const checkOut = dto.checkOutDate ? new Date(dto.checkOutDate) : existingReservation.checkOutDate;
        
        this.validateReservationDates(
          checkIn.toISOString().split('T')[0], 
          checkOut.toISOString().split('T')[0]
        );

        // Verificar disponibilidad excluyendo la reserva actual
        const overlapping = await this.repository.findOverlappingReservations(
          existingReservation.roomId, 
          checkIn, 
          checkOut,
          id
        );
        
        if (overlapping.length > 0) {
          throw new ConflictException('La habitación no está disponible en las nuevas fechas');
        }
      }

      // Validar capacidad si se está cambiando el número de huéspedes
      if (dto.guestCount) {
        await this.validateRoomCapacity(existingReservation.roomId, dto.guestCount);
      }

      const updatedReservation = await this.repository.update(id, dto);

      return {
        success: true,
        data: updatedReservation,
        message: 'Reserva actualizada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al actualizar reserva');
    }
  }

  /**
   * Cambiar estado de reserva
   */
  async changeStatus(id: number, dto: ChangeReservationStatusDto): Promise<ApiResponse<IReservation>> {
    try {
      const reservation = await this.repository.findById(id);
      if (!reservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Validar transición de estado
      this.validateStatusTransition(reservation.status, dto.status);

      // TODO: Actualizar estado en repository (necesita método específico)
      // const updatedReservation = await this.repository.updateStatus(id, dto.status);

      return {
        success: true,
        data: reservation, // Temporal hasta implementar updateStatus
        message: `Estado de reserva cambiado a ${dto.status}`,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al cambiar estado');
    }
  }

  /**
   * Cancelar reserva (soft delete)
   */
  async cancel(id: number): Promise<ApiResponse<void>> {
    try {
      const reservation = await this.repository.findById(id);
      if (!reservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('La reserva ya está cancelada');
      }

      await this.repository.delete(id);

      return {
        success: true,
        data: undefined,
        message: 'Reserva cancelada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno del servidor al cancelar reserva');
    }
  }

  /**
   * Obtener reservas por cliente
   */
  async findByCustomer(customerId: number): Promise<ApiResponse<IReservation[]>> {
    try {
      const reservations = await this.repository.findByCustomer(customerId);
      
      return {
        success: true,
        data: reservations,
        message: `${reservations.length} reservas encontradas para el cliente`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error interno del servidor al obtener reservas del cliente');
    }
  }

  // ==========================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ==========================================

  /**
   * Validar que el código de reserva sea único
   */
  private async validateUniqueReservationCode(code: string): Promise<void> {
    const isUnique = await this.repository.isCodeUnique(code);
    if (!isUnique) {
      throw new ConflictException('El código de reserva ya existe');
    }
  }

  /**
   * VALIDACIÓN CRÍTICA: Verificar disponibilidad de habitación
   */
  private async validateRoomAvailability(roomId: number, checkIn: Date, checkOut: Date): Promise<void> {
    // 1. Verificar que la habitación existe
    const room = await this.getRoomWithPricing(roomId);
    
    // 2. Verificar que está disponible (estado AVAILABLE)
    if (room.status !== 'AVAILABLE') {
      throw new BadRequestException(`La habitación está en estado: ${room.status}`);
    }
    
    // 3. Verificar que no hay reservas solapadas
    const overlapping = await this.repository.findOverlappingReservations(roomId, checkIn, checkOut);
    if (overlapping.length > 0) {
      throw new ConflictException(
        `La habitación ya está reservada en las fechas seleccionadas. ` +
        `Conflictos encontrados: ${overlapping.length} reservas`
      );
    }
  }

  /**
   * Validar capacidad de habitación vs número de huéspedes
   */
  private async validateRoomCapacity(roomId: number, guestCount: number): Promise<void> {
    const room = await this.getRoomWithPricing(roomId);
    
    if (guestCount > room.roomType.capacity) {
      throw new BadRequestException(
        `La habitación ${room.name} solo soporta ${room.roomType.capacity} huéspedes, ` +
        `se solicitaron ${guestCount} huéspedes`
      );
    }
  }

  /**
   * VALIDACIÓN CRÍTICA: Cliente mayor de 18 años para ser titular
   */
  private async validateCustomerEligibility(customerId: number): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
    });

    if (!customer) {
      throw new BadRequestException('El cliente no existe');
    }
    
    if (customer.dateOfBirth) {
      const age = DateValidationUtils.calculateAge(customer.dateOfBirth);
      if (age < 18) {
        throw new BadRequestException(
          `El titular de la reserva debe ser mayor de 18 años. ` +
          `Cliente ${customer.firstName} ${customer.lastName} tiene ${age} años`
        );
      }
    } else {
      throw new BadRequestException(
        'El cliente debe tener fecha de nacimiento registrada para ser titular de reserva'
      );
    }
  }

  /**
   * Validar plan de comida
   */
  private async validateMealPlan(mealPlanId: number): Promise<void> {
    const mealPlan = await this.getMealPlanWithPricing(mealPlanId);
    
    if (!mealPlan.isActive) {
      throw new BadRequestException('El plan de comida no está activo');
    }
  }

  /**
   * Validar fechas de reserva
   */
  private validateReservationDates(checkInDate: string, checkOutDate: string): void {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fecha de entrada debe ser hoy o futura
    if (checkIn < today) {
      throw new BadRequestException('La fecha de entrada debe ser hoy o una fecha futura');
    }

    // Fecha de salida debe ser posterior a entrada
    if (checkOut <= checkIn) {
      throw new BadRequestException('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    // Validar duración de estadía
    const nights = DateValidationUtils.calculateNights(checkIn, checkOut);
    if (nights < 1 || nights > 30) {
      throw new BadRequestException('La estadía debe ser mínimo 1 noche y máximo 30 noches');
    }

    // Validar ventana de reserva (máximo 1 año adelante)
    if (!DateValidationUtils.isWithinBookingWindow(checkIn)) {
      throw new BadRequestException('No se pueden hacer reservas con más de 1 año de anticipación');
    }
  }

  /**
   * Validar transición de estado
   */
  private validateStatusTransition(currentStatus: ReservationStatus, newStatus: ReservationStatus): void {
    const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
      [ReservationStatus.CONFIRMED]: [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED],
      [ReservationStatus.COMPLETED]: [], // Estado final
      [ReservationStatus.CANCELLED]: [], // Estado final
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`
      );
    }
  }

  /**
   * Calcular descuento basado en el tipo
   */
  private calculateDiscountAmount(subtotal: number, discountType: any, nights: number): number {
    if (!discountType || discountType === 'NONE') {
      return 0;
    }

    switch (discountType) {
      case 'LONG_STAY':
        // 10% de descuento para estadías de 7 noches o más
        return nights >= 7 ? subtotal * 0.1 : 0;
      
      case 'FREQUENT_GUEST':
        // 5% de descuento para huéspedes frecuentes
        return subtotal * 0.05;
      
      case 'CORPORATE':
        // 15% de descuento corporativo
        return subtotal * 0.15;
      
      case 'PROMOTIONAL':
        // 20% de descuento promocional
        return subtotal * 0.2;
      
      default:
        return 0;
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  /**
   * Obtener habitación con información de precios
   */
  private async getRoomWithPricing(roomId: number): Promise<any> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            description: true,
            capacity: true,
            basePrice: true,
          }
        }
      },
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    return {
      ...room,
      roomType: {
        ...room.roomType,
        basePrice: Number(room.roomType.basePrice),
      },
    };
  }

  /**
   * Obtener plan de comida con información de precios
   */
  private async getMealPlanWithPricing(mealPlanId: number): Promise<any> {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        dailyPrice: true,
        isActive: true,
      },
    });

    if (!mealPlan) {
      throw new NotFoundException('Plan de comida no encontrado');
    }

    return {
      ...mealPlan,
      dailyPrice: Number(mealPlan.dailyPrice),
    };
  }
}
