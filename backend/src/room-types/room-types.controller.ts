import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { RoomTypeResponse, RoomTypeListResponse } from './interfaces/room-type.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('room-types')
@Controller('room-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo tipo de habitación',
    description: 'Crea un nuevo tipo de habitación con validaciones de negocio'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tipo de habitación creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Tipo de habitación "Suite Presidencial" creado exitosamente',
        data: {
          id: 1,
          name: 'Suite Presidencial',
          capacity: 4,
          basePrice: 250.00,
          description: 'Amplia suite con vista al mar',
          amenities: ['Wi-Fi', 'TV Smart', 'Minibar'],
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
        message: 'Ya existe un tipo de habitación con el nombre "Suite Presidencial". Cada tipo debe tener un nombre único',
        errors: ['Nombre duplicado'],
        code: 'ROOM_TYPE_NAME_EXISTS'
      }
    }
  })
  async create(@Body() createRoomTypeDto: CreateRoomTypeDto): Promise<RoomTypeResponse> {
    return this.roomTypesService.create(createRoomTypeDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los tipos de habitación',
    description: 'Lista todos los tipos de habitación activos con información de habitaciones asignadas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tipos de habitación obtenida exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Se encontraron 3 tipos de habitación en el sistema',
        data: [
          {
            id: 1,
            name: 'Suite Presidencial',
            capacity: 4,
            basePrice: 250.00,
            description: 'Amplia suite con vista al mar',
            amenities: ['Wi-Fi', 'TV Smart', 'Minibar'],
            roomCount: 2,
            createdAt: '2025-08-27T20:00:00.000Z',
            updatedAt: '2025-08-27T20:00:00.000Z'
          }
        ]
      }
    }
  })
  async findAll(): Promise<RoomTypeListResponse> {
    return this.roomTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener tipo de habitación por ID',
    description: 'Obtiene los detalles completos de un tipo de habitación específico'
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de habitación encontrado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de habitación no encontrado',
    schema: {
      example: {
        success: false,
        message: 'No se encontró tipo de habitación con el identificador 1',
        errors: ['tipo de habitación no encontrado']
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoomTypeResponse> {
    return this.roomTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar tipo de habitación',
    description: 'Actualiza parcialmente un tipo de habitación existente'
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de habitación actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de habitación no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación o regla de negocio' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRoomTypeDto: UpdateRoomTypeDto
  ): Promise<RoomTypeResponse> {
    return this.roomTypesService.update(id, updateRoomTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar tipo de habitación',
    description: 'Elimina (soft delete) un tipo de habitación si no tiene habitaciones asignadas'
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de habitación', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Tipo de habitación eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tipo de habitación no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar porque tiene habitaciones asignadas',
    schema: {
      example: {
        success: false,
        message: 'No se puede eliminar el tipo de habitación "Suite Presidencial" porque tiene habitaciones asignadas. Primero elimine o reasigne las habitaciones',
        errors: ['Tipo con habitaciones asignadas'],
        code: 'ROOM_TYPE_HAS_ROOMS'
      }
    }
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<RoomTypeResponse> {
    return this.roomTypesService.remove(id);
  }
}
