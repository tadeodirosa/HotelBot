import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateReservationDto, UpdateReservationDto } from './dto/reservation.dto';
import { 
  IReservation, 
  IReservationRepository, 
  IReservationFilters,
  IReservationStats
} from './interfaces/reservation.interface';
import { ReservationStatus } from './interfaces/reservation.enums';
import { DateValidationUtils } from './validators/date.validators';

@Injectable()
export class ReservationsRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva reserva
   */
  async create(dto: CreateReservationDto): Promise<IReservation> {
    const startDate = new Date(dto.checkInDate);
    const endDate = new Date(dto.checkOutDate);
    
    // Calcular el monto total automáticamente
    const totalAmount = await this.calculateTotalAmount(
      dto.roomId,
      dto.mealPlanId,
      startDate,
      endDate
    );

    // Crear la reserva con transacción para incluir la relación con el cliente
    const reservation = await this.prisma.$transaction(async (tx) => {
      // Crear la reserva
      const newReservation = await tx.reservation.create({
        data: {
          reservationCode: dto.reservationCode,
          roomId: dto.roomId,
          mealPlanId: dto.mealPlanId,
          startDate,
          endDate,
          guestCount: dto.guestCount,
          totalAmount,
          status: ReservationStatus.PENDING,
          specialRequests: {
            requests: dto.specialRequests || '',
            notes: dto.notes || '',
            paymentMethod: dto.paymentMethod || 'PENDING',
            discountType: dto.discountType || 'NONE',
          },
        },
      });

      // Crear la relación cliente-reserva
      await tx.customerReservation.create({
        data: {
          customerId: dto.customerId,
          reservationId: newReservation.id,
          isPrimaryGuest: true,
        },
      });

      // Retornar la reserva con todas las relaciones
      return tx.reservation.findUnique({
        where: { id: newReservation.id },
        include: {
          customers: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  dni: true,
                  dateOfBirth: true,
                }
              }
            }
          },
          room: {
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
            }
          },
          mealPlan: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              dailyPrice: true,
            }
          },
        },
      });
    });

    return this.transformReservation(reservation);
  }

  /**
   * Obtener todas las reservas con filtros y paginación
   */
  async findAll(filters?: IReservationFilters): Promise<{
    data: IReservation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      customerId,
      roomId,
      checkInDateFrom,
      checkInDateTo,
      sortBy = 'startDate',
      sortOrder = 'asc',
    } = filters || {};

    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {
      cancelledAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (customerId) {
      where.customers = {
        some: {
          customerId,
        }
      };
    }

    if (checkInDateFrom || checkInDateTo) {
      where.startDate = {};
      if (checkInDateFrom) {
        where.startDate.gte = new Date(checkInDateFrom);
      }
      if (checkInDateTo) {
        where.startDate.lte = new Date(checkInDateTo);
      }
    }

    if (search) {
      where.OR = [
        { reservationCode: { contains: search, mode: 'insensitive' } },
        {
          customers: {
            some: {
              customer: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { dni: { contains: search, mode: 'insensitive' } },
                ]
              }
            }
          }
        }
      ];
    }

    // Mapear sortBy a los campos correctos del schema
    let orderByField = sortBy;
    if (sortBy === 'checkInDate') orderByField = 'startDate';
    if (sortBy === 'checkOutDate') orderByField = 'endDate';

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderByField]: sortOrder,
        },
        include: {
          customers: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  dni: true,
                }
              }
            }
          },
          room: {
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
            }
          },
          mealPlan: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              dailyPrice: true,
            }
          },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data: data.map(reservation => this.transformReservation(reservation)),
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener reserva por ID
   */
  async findById(id: number): Promise<IReservation | null> {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id,
        cancelledAt: null,
      },
      include: {
        customers: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                dni: true,
                dateOfBirth: true,
              }
            }
          }
        },
        room: {
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
          }
        },
        mealPlan: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            dailyPrice: true,
          }
        },
      },
    });

    return reservation ? this.transformReservation(reservation) : null;
  }

  /**
   * Obtener reserva por código
   */
  async findByCode(code: string): Promise<IReservation | null> {
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        reservationCode: code,
        cancelledAt: null,
      },
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
        mealPlan: true,
      },
    });

    return reservation ? this.transformReservation(reservation) : null;
  }

  /**
   * MÉTODO CRÍTICO: Encontrar reservas que se solapan con un rango de fechas
   */
  async findOverlappingReservations(
    roomId: number,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: number
  ): Promise<IReservation[]> {
    const where: any = {
      roomId,
      cancelledAt: null,
      status: {
        not: ReservationStatus.CANCELLED,
      },
      AND: [
        {
          OR: [
            // Caso 1: La reserva existente comienza dentro del rango solicitado
            {
              startDate: {
                gte: checkIn,
                lt: checkOut,
              },
            },
            // Caso 2: La reserva existente termina dentro del rango solicitado
            {
              endDate: {
                gt: checkIn,
                lte: checkOut,
              },
            },
            // Caso 3: La reserva existente contiene completamente el rango solicitado
            {
              AND: [
                { startDate: { lte: checkIn } },
                { endDate: { gte: checkOut } },
              ],
            },
          ],
        },
      ],
    };

    // Excluir una reserva específica (útil para actualizaciones)
    if (excludeReservationId) {
      where.id = { not: excludeReservationId };
    }

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
      },
    });

    return reservations.map(reservation => this.transformReservation(reservation));
  }

  /**
   * MÉTODO CRÍTICO: Encontrar habitaciones disponibles en un rango de fechas
   */
  async findAvailableRooms(
    checkIn: Date,
    checkOut: Date,
    guestCount: number,
    roomTypeId?: number
  ): Promise<any[]> {
    const where: any = {
      status: 'AVAILABLE',
      roomType: {
        capacity: { gte: guestCount },
      },
      NOT: {
        reservations: {
          some: {
            cancelledAt: null,
            status: {
              not: ReservationStatus.CANCELLED,
            },
            AND: [
              {
                OR: [
                  // Reserva comienza durante el período solicitado
                  {
                    startDate: { gte: checkIn, lt: checkOut },
                  },
                  // Reserva termina durante el período solicitado
                  {
                    endDate: { gt: checkIn, lte: checkOut },
                  },
                  // Reserva contiene el período completo
                  {
                    AND: [
                      { startDate: { lte: checkIn } },
                      { endDate: { gte: checkOut } },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    };

    // Filtrar por tipo de habitación si se especifica
    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    return this.prisma.room.findMany({
      where,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            description: true,
            capacity: true,
            basePrice: true,
            amenities: true,
          }
        },
      },
      orderBy: [
        { roomType: { basePrice: 'asc' } },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Actualizar una reserva
   */
  async update(id: number, dto: UpdateReservationDto): Promise<IReservation> {
    const existingReservation = await this.findById(id);
    if (!existingReservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const updateData: any = {};

    // Solo actualizar campos proporcionados
    if (dto.reservationCode) updateData.reservationCode = dto.reservationCode;
    if (dto.checkInDate) updateData.startDate = new Date(dto.checkInDate);
    if (dto.checkOutDate) updateData.endDate = new Date(dto.checkOutDate);
    if (dto.guestCount) updateData.guestCount = dto.guestCount;

    // Actualizar special requests con nueva información
    if (dto.paymentMethod || dto.discountType || dto.specialRequests || dto.notes) {
      const currentRequests = existingReservation.specialRequests || {};
      updateData.specialRequests = {
        ...currentRequests,
        ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
        ...(dto.discountType && { discountType: dto.discountType }),
        ...(dto.specialRequests !== undefined && { requests: dto.specialRequests }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      };
    }

    // Recalcular precios si cambiaron las fechas
    if (dto.checkInDate || dto.checkOutDate) {
      const checkIn = dto.checkInDate ? new Date(dto.checkInDate) : existingReservation.checkInDate;
      const checkOut = dto.checkOutDate ? new Date(dto.checkOutDate) : existingReservation.checkOutDate;
      
      const totalAmount = await this.calculateTotalAmount(
        existingReservation.roomId,
        existingReservation.mealPlanId,
        checkIn,
        checkOut
      );

      updateData.totalAmount = totalAmount;
    }

    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
        mealPlan: true,
      },
    });

    return this.transformReservation(updatedReservation);
  }

  /**
   * Eliminar (soft delete) una reserva
   */
  async delete(id: number): Promise<void> {
    await this.prisma.reservation.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
        status: ReservationStatus.CANCELLED,
      },
    });
  }

  /**
   * Verificar si una habitación está disponible
   */
  async isRoomAvailable(roomId: number, checkIn: Date, checkOut: Date): Promise<boolean> {
    const overlapping = await this.findOverlappingReservations(roomId, checkIn, checkOut);
    return overlapping.length === 0;
  }

  /**
   * Verificar si un código de reserva es único
   */
  async isCodeUnique(code: string, excludeId?: number): Promise<boolean> {
    const where: any = {
      reservationCode: code,
      cancelledAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await this.prisma.reservation.findFirst({ where });
    return !existing;
  }

  /**
   * Obtener reservas por cliente
   */
  async findByCustomer(customerId: number): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        customers: {
          some: {
            customerId,
          }
        },
        cancelledAt: null,
      },
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
        mealPlan: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return reservations.map(reservation => this.transformReservation(reservation));
  }

  /**
   * Obtener reservas por rango de fechas
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate,
        },
        cancelledAt: null,
      },
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
        mealPlan: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return reservations.map(reservation => this.transformReservation(reservation));
  }

  /**
   * Obtener reservas por estado
   */
  async findByStatus(status: ReservationStatus): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: status as any, // Cast para evitar error de tipos
        cancelledAt: null,
      },
      include: {
        customers: {
          include: {
            customer: true
          }
        },
        room: {
          include: { roomType: true }
        },
        mealPlan: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return reservations.map(reservation => this.transformReservation(reservation));
  }

  /**
   * Obtener estadísticas de reservas
   */
  async getReservationStats(startDate?: Date, endDate?: Date): Promise<IReservationStats> {
    const where: any = {
      cancelledAt: null,
    };

    if (startDate && endDate) {
      where.startDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      revenueResult,
    ] = await Promise.all([
      this.prisma.reservation.count({ where }),
      this.prisma.reservation.count({ where: { ...where, status: ReservationStatus.PENDING as any } }),
      this.prisma.reservation.count({ where: { ...where, status: ReservationStatus.CONFIRMED as any } }),
      this.prisma.reservation.count({ where: { ...where, status: ReservationStatus.COMPLETED as any } }),
      this.prisma.reservation.count({ where: { ...where, status: ReservationStatus.CANCELLED as any } }),
      this.prisma.reservation.aggregate({
        where: {
          ...where,
          status: { not: ReservationStatus.CANCELLED as any },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      checkedInReservations: completedReservations, // Usar completed como proxy para checked-in
      cancelledReservations,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      averageStayDuration: 0, // Calculado en el service
      occupancyRate: 0, // Calculado en el service
    };
  }

  /**
   * Calcular tasa de ocupación para una fecha específica
   */
  async getOccupancyRate(date: Date): Promise<number> {
    const [totalRooms, occupiedRooms] = await Promise.all([
      this.prisma.room.count({
        where: {
          status: 'AVAILABLE',
        },
      }),
      this.prisma.reservation.count({
        where: {
          startDate: { lte: date },
          endDate: { gt: date },
          status: {
            in: [ReservationStatus.CONFIRMED as any, ReservationStatus.COMPLETED as any],
          },
          cancelledAt: null,
        },
      }),
    ]);

    return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  }

  /**
   * MÉTODO PRIVADO: Calcular el monto total de una reserva
   */
  private async calculateTotalAmount(
    roomId: number,
    mealPlanId: number | undefined,
    checkIn: Date,
    checkOut: Date
  ): Promise<number> {
    const nights = DateValidationUtils.calculateNights(checkIn, checkOut);
    
    // Obtener precio de la habitación
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    });

    if (!room) {
      throw new BadRequestException('Habitación no encontrada');
    }

    const roomPrice = Number(room.roomType.basePrice);
    const roomTotal = roomPrice * nights;

    // Obtener precio del plan de comida si existe
    let mealPlanTotal = 0;

    if (mealPlanId) {
      const mealPlan = await this.prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
      });

      if (mealPlan && mealPlan.isActive) {
        const mealPlanPrice = Number(mealPlan.dailyPrice);
        mealPlanTotal = mealPlanPrice * nights;
      }
    }

    return roomTotal + mealPlanTotal;
  }

  /**
   * MÉTODO PRIVADO: Transformar reserva de Prisma a IReservation
   */
  private transformReservation(reservation: any): IReservation {
    const specialRequests = reservation.specialRequests || {};
    
    // Obtener el cliente principal (isPrimaryGuest = true)
    const primaryCustomer = reservation.customers?.find(cr => cr.isPrimaryGuest)?.customer;
    
    return {
      id: reservation.id,
      reservationCode: reservation.reservationCode,
      customerId: primaryCustomer?.id || 0, // Cliente principal
      roomId: reservation.roomId,
      mealPlanId: reservation.mealPlanId,
      checkInDate: reservation.startDate,
      checkOutDate: reservation.endDate,
      guestCount: reservation.guestCount,
      totalAmount: Number(reservation.totalAmount),
      discountAmount: 0, // No implementado en el schema actual
      finalAmount: Number(reservation.totalAmount), // Mismo que total por ahora
      status: reservation.status,
      paymentMethod: specialRequests.paymentMethod,
      discountType: specialRequests.discountType,
      specialRequests: specialRequests.requests,
      notes: specialRequests.notes,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      deletedAt: reservation.cancelledAt,
      
      // Relaciones
      customer: primaryCustomer ? {
        id: primaryCustomer.id,
        firstName: primaryCustomer.firstName,
        lastName: primaryCustomer.lastName,
        email: primaryCustomer.email,
        phone: primaryCustomer.phone,
        dni: primaryCustomer.dni,
        dateOfBirth: primaryCustomer.dateOfBirth,
      } : undefined,
      room: reservation.room ? {
        id: reservation.room.id,
        name: reservation.room.name,
        roomTypeId: reservation.room.roomTypeId,
        floor: reservation.room.floor,
        status: reservation.room.status,
        roomType: reservation.room.roomType ? {
          id: reservation.room.roomType.id,
          name: reservation.room.roomType.name,
          description: reservation.room.roomType.description,
          capacity: reservation.room.roomType.capacity,
          basePrice: Number(reservation.room.roomType.basePrice),
        } : undefined,
      } : undefined,
      mealPlan: reservation.mealPlan ? {
        id: reservation.mealPlan.id,
        name: reservation.mealPlan.name,
        description: reservation.mealPlan.description,
        type: reservation.mealPlan.type,
        dailyPrice: Number(reservation.mealPlan.dailyPrice),
        isActive: reservation.mealPlan.isActive,
      } : undefined,
    };
  }
}
