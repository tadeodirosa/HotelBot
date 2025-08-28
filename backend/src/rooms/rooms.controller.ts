import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from './dto/room.dto';
import { RoomResponse, RoomListResponse } from './interfaces/room.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva habitación',
    description: 'Crea una nueva habitación con validaciones de negocio y asignación de tipo'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Habitación creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Habitación "101" creada exitosamente',
        data: {
          id: 1,
          name: '101',
          floor: 1,
          status: 'available',
          roomType: {
            id: 1,
            name: 'Suite Presidencial',
            capacity: 4,
            basePrice: 250.00
          },
          createdAt: '2025-08-27T20:00:00.000Z',
          updatedAt: '2025-08-27T20:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación o regla de negocio',
    schema: {
      example: {
        success: false,
        message: 'Ya existe una habitación con el nombre "101". Cada habitación debe tener un nombre único',
        errors: ['Nombre duplicado'],
        code: 'ROOM_NAME_EXISTS'
      }
    }
  })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<RoomResponse> {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las habitaciones',
    description: 'Lista todas las habitaciones activas con información del tipo y estado de reservas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de habitaciones obtenida exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Se encontraron 5 habitaciones en el sistema',
        data: [
          {
            id: 1,
            name: '101',
            floor: 1,
            status: 'available',
            roomType: {
              id: 1,
              name: 'Suite Presidencial',
              capacity: 4,
              basePrice: 250.00
            },
            hasActiveReservations: false,
            createdAt: '2025-08-27T20:00:00.000Z',
            updatedAt: '2025-08-27T20:00:00.000Z'
          }
        ]
      }
    }
  })
  async findAll(): Promise<RoomListResponse> {
    return this.roomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener habitación por ID',
    description: 'Obtiene los detalles completos de una habitación específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Habitación encontrada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Habitación no encontrada',
    schema: {
      example: {
        success: false,
        message: 'No se encontró habitación con el identificador 1',
        errors: ['habitación no encontrada']
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoomResponse> {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar habitación',
    description: 'Actualiza parcialmente una habitación existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Habitación actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Habitación no encontrada' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación o regla de negocio' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRoomDto: UpdateRoomDto
  ): Promise<RoomResponse> {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Actualizar estado de habitación',
    description: 'Cambia el estado de una habitación (disponible, ocupada, mantenimiento, fuera de servicio)'
  })
  @ApiParam({ name: 'id', description: 'ID de la habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de habitación actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede cambiar el estado porque tiene reservas activas',
    schema: {
      example: {
        success: false,
        message: 'No se puede cambiar el estado de la habitación "101" a "maintenance" porque tiene reservas activas. Cancele o complete las reservas primero',
        errors: ['Habitación con reservas activas'],
        code: 'ROOM_HAS_ACTIVE_RESERVATIONS'
      }
    }
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateRoomStatusDto
  ): Promise<RoomResponse> {
    return this.roomsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar habitación',
    description: 'Elimina (soft delete) una habitación si no tiene reservas activas'
  })
  @ApiParam({ name: 'id', description: 'ID de la habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Habitación eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Habitación no encontrada' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar porque tiene reservas activas',
    schema: {
      example: {
        success: false,
        message: 'No se puede eliminar la habitación "101" porque tiene reservas activas. Cancele o complete las reservas primero',
        errors: ['Habitación con reservas activas'],
        code: 'ROOM_HAS_ACTIVE_RESERVATIONS'
      }
    }
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RoomResponse> {
    return this.roomsService.remove(id);
  }
}
