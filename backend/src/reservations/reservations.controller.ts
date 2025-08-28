import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ChangeReservationStatusDto,
  CheckAvailabilityDto,
  ReservationSearchDto,
  CalculateReservationPriceDto,
} from './dto/reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reservations')
@Controller('reservations')
// @UseGuards(JwtAuthGuard)  // Temporalmente deshabilitado para testing
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Crear nueva reserva
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva reserva',
    description: 'Crea una nueva reserva con validaciones exhaustivas de disponibilidad, fechas, capacidad y edad del titular'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Reserva creada exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          reservationCode: 'RSV-2025-001',
          customerId: 1,
          roomId: 1,
          checkInDate: '2025-09-01T00:00:00Z',
          checkOutDate: '2025-09-05T00:00:00Z',
          guestCount: 2,
          totalAmount: 400.00,
          status: 'PENDING'
        },
        message: 'Reserva creada exitosamente'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        success: false,
        message: 'La fecha de entrada debe ser futura',
        errors: ['checkInDate: La fecha de entrada debe ser hoy o una fecha futura']
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Conflicto: habitación no disponible o código duplicado',
    schema: {
      example: {
        success: false,
        message: 'La habitación ya está reservada en las fechas seleccionadas',
      }
    }
  })
  @ApiBody({ type: CreateReservationDto })
  async create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  /**
   * Verificar disponibilidad de habitación específica
   */
  @Get('check-availability')
  @ApiOperation({ 
    summary: 'Verificar disponibilidad de habitación',
    description: 'Verifica si una habitación específica está disponible en un rango de fechas'
  })
  @ApiQuery({ name: 'roomId', type: Number, description: 'ID de la habitación a verificar' })
  @ApiQuery({ name: 'checkInDate', type: String, description: 'Fecha de check-in (YYYY-MM-DD)' })
  @ApiQuery({ name: 'checkOutDate', type: String, description: 'Fecha de check-out (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Disponibilidad verificada',
    schema: {
      example: {
        success: true,
        data: {
          available: true,
          roomDetails: {
            id: 1,
            name: 'Habitación 101',
            status: 'AVAILABLE',
            roomType: {
              name: 'Suite Deluxe',
              capacity: 4,
              basePrice: 150.00
            }
          },
          conflictingReservations: [],
          message: 'Habitación disponible en las fechas seleccionadas'
        },
        message: 'Disponibilidad confirmada'
      }
    }
  })
  async checkAvailability(
    @Query('roomId', ParseIntPipe) roomId: number,
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
  ) {
    return this.reservationsService.checkRoomAvailability(roomId, checkInDate, checkOutDate);
  }

  /**
   * Buscar habitaciones disponibles
   */
  @Post('search-available-rooms')
  @ApiOperation({ 
    summary: 'Buscar habitaciones disponibles',
    description: 'Busca todas las habitaciones disponibles que cumplan con los criterios especificados'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Habitaciones disponibles encontradas',
    schema: {
      example: {
        success: true,
        data: {
          availableRooms: [
            {
              id: 1,
              name: 'Habitación 101',
              roomType: {
                name: 'Suite Deluxe',
                capacity: 4,
                basePrice: 150.00
              }
            }
          ],
          totalAvailable: 1,
          searchCriteria: {
            checkInDate: '2025-09-01',
            checkOutDate: '2025-09-05',
            guestCount: 2,
            nights: 4
          }
        },
        message: '1 habitaciones disponibles encontradas'
      }
    }
  })
  @ApiBody({ type: CheckAvailabilityDto })
  async findAvailableRooms(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return this.reservationsService.findAvailableRooms(checkAvailabilityDto);
  }

  /**
   * Calcular precio de reserva
   */
  @Post('calculate-price')
  @ApiOperation({ 
    summary: 'Calcular precio de reserva',
    description: 'Calcula el precio total de una reserva incluyendo habitación, plan de comida y descuentos'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Precio calculado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          roomPrice: 150.00,
          mealPlanPrice: 25.00,
          subtotal: 700.00,
          discountAmount: 70.00,
          totalAmount: 630.00,
          nights: 4,
          pricePerNight: 175.00,
          breakdown: {
            roomTotal: 600.00,
            mealPlanTotal: 100.00,
            taxes: 0,
            fees: 0
          }
        },
        message: 'Precio calculado exitosamente'
      }
    }
  })
  @ApiBody({ type: CalculateReservationPriceDto })
  async calculatePrice(@Body() calculatePriceDto: CalculateReservationPriceDto) {
    return this.reservationsService.calculatePrice(calculatePriceDto);
  }

  /**
   * Listar todas las reservas con filtros
   */
  @Get()
  @ApiOperation({ 
    summary: 'Listar reservas con filtros',
    description: 'Obtiene una lista paginada de reservas con opciones de filtrado y búsqueda'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Búsqueda por código o nombre de cliente' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], description: 'Filtrar por estado' })
  @ApiQuery({ name: 'customerId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'roomId', required: false, type: Number, description: 'Filtrar por ID de habitación' })
  @ApiQuery({ name: 'checkInDateFrom', required: false, type: String, description: 'Fecha de check-in desde (YYYY-MM-DD)' })
  @ApiQuery({ name: 'checkInDateTo', required: false, type: String, description: 'Fecha de check-in hasta (YYYY-MM-DD)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['checkInDate', 'checkOutDate', 'totalAmount', 'status', 'createdAt'], description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Orden de clasificación' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de reservas obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          data: [{
            id: 1,
            reservationCode: 'RSV-2025-001',
            customer: {
              firstName: 'Juan',
              lastName: 'García',
              email: 'juan@email.com'
            },
            room: {
              name: 'Habitación 101',
              roomType: { name: 'Suite Deluxe' }
            },
            checkInDate: '2025-09-01T00:00:00Z',
            checkOutDate: '2025-09-05T00:00:00Z',
            guestCount: 2,
            totalAmount: 600.00,
            status: 'CONFIRMED'
          }],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        },
        message: '1 reservas encontradas'
      }
    }
  })
  async findAll(@Query() searchDto: ReservationSearchDto) {
    return this.reservationsService.findAll(searchDto);
  }

  /**
   * Obtener reserva por ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener reserva por ID',
    description: 'Obtiene los detalles completos de una reserva específica'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID único de la reserva' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reserva encontrada',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          reservationCode: 'RSV-2025-001',
          customer: {
            id: 1,
            firstName: 'Juan',
            lastName: 'García',
            email: 'juan@email.com',
            phone: '+34 666 123 456',
            dni: '12345678A'
          },
          room: {
            id: 1,
            name: 'Habitación 101',
            roomType: {
              name: 'Suite Deluxe',
              capacity: 4,
              basePrice: 150.00
            }
          },
          mealPlan: {
            id: 2,
            name: 'Desayuno Buffet',
            dailyPrice: 25.00
          },
          checkInDate: '2025-09-01T00:00:00Z',
          checkOutDate: '2025-09-05T00:00:00Z',
          guestCount: 2,
          totalAmount: 700.00,
          status: 'CONFIRMED',
          specialRequests: 'Vista al mar',
          notes: 'Cliente VIP'
        },
        message: 'Reserva obtenida exitosamente'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Reserva no encontrada',
    schema: {
      example: {
        success: false,
        message: 'Reserva no encontrada'
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  /**
   * Obtener reserva por código
   */
  @Get('code/:code')
  @ApiOperation({ 
    summary: 'Obtener reserva por código',
    description: 'Busca una reserva utilizando su código único'
  })
  @ApiParam({ name: 'code', type: String, description: 'Código único de la reserva (ej: RSV-2025-001)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reserva encontrada por código' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Reserva no encontrada' 
  })
  async findByCode(@Param('code') code: string) {
    return this.reservationsService.findByCode(code);
  }

  /**
   * Obtener reservas por cliente
   */
  @Get('customer/:customerId')
  @ApiOperation({ 
    summary: 'Obtener reservas por cliente',
    description: 'Obtiene todas las reservas de un cliente específico'
  })
  @ApiParam({ name: 'customerId', type: Number, description: 'ID del cliente' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reservas del cliente obtenidas exitosamente' 
  })
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.reservationsService.findByCustomer(customerId);
  }

  /**
   * Actualizar reserva
   */
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar reserva',
    description: 'Actualiza los datos de una reserva existente con validaciones de disponibilidad'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la reserva a actualizar' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reserva actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Reserva no encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Conflicto en las nuevas fechas o código duplicado' 
  })
  @ApiBody({ type: UpdateReservationDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  /**
   * Cambiar estado de reserva
   */
  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Cambiar estado de reserva',
    description: 'Cambia el estado de una reserva (PENDING → CONFIRMED → COMPLETED o CANCELLED)'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la reserva' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estado de reserva cambiado exitosamente' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Transición de estado inválida' 
  })
  @ApiBody({ type: ChangeReservationStatusDto })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeReservationStatusDto,
  ) {
    return this.reservationsService.changeStatus(id, changeStatusDto);
  }

  /**
   * Cancelar reserva
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Cancelar reserva',
    description: 'Cancela una reserva (soft delete) cambiando su estado a CANCELLED'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la reserva a cancelar' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Reserva cancelada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Reserva cancelada exitosamente'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Reserva no encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'La reserva ya está cancelada' 
  })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(id);
  }
}
