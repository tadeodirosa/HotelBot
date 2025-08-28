import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from './room-types.repository';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { RoomTypeResponse, RoomTypeListResponse, RoomTypeData } from './interfaces/room-type.interface';
import { BusinessRuleException, EntityNotFoundException } from '../shared/exceptions/business.exception';

@Injectable()
export class RoomTypesService {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async findAll(): Promise<RoomTypeListResponse> {
    const roomTypes = await this.roomTypeRepository.findAll();
    
    const data: RoomTypeData[] = roomTypes.map(roomType => ({
      id: roomType.id,
      name: roomType.name,
      capacity: roomType.capacity,
      basePrice: Number(roomType.basePrice),
      description: roomType.description,
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities as string[] : [],
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
      roomCount: (roomType as any)._count?.rooms || 0,
    }));

    return {
      success: true,
      message: `Se encontraron ${data.length} tipos de habitación en el sistema`,
      data,
    };
  }

  async findOne(id: number): Promise<RoomTypeResponse> {
    const roomType = await this.roomTypeRepository.findById(id);
    
    if (!roomType) {
      throw new EntityNotFoundException('tipo de habitación', id);
    }

    const data: RoomTypeData = {
      id: roomType.id,
      name: roomType.name,
      capacity: roomType.capacity,
      basePrice: Number(roomType.basePrice),
      description: roomType.description,
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities as string[] : [],
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
      roomCount: (roomType as any)._count?.rooms || 0,
    };

    return {
      success: true,
      message: 'Tipo de habitación encontrado exitosamente',
      data,
    };
  }

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomTypeResponse> {
    // Validar que no existe un tipo con el mismo nombre
    const existingRoomType = await this.roomTypeRepository.findByName(createRoomTypeDto.name);
    if (existingRoomType) {
      throw new BusinessRuleException({
        code: 'ROOM_TYPE_NAME_EXISTS',
        message: `Ya existe un tipo de habitación con el nombre "${createRoomTypeDto.name}". Cada tipo debe tener un nombre único`,
        details: { existingId: existingRoomType.id },
      });
    }

    const roomType = await this.roomTypeRepository.create(createRoomTypeDto);

    const data: RoomTypeData = {
      id: roomType.id,
      name: roomType.name,
      capacity: roomType.capacity,
      basePrice: Number(roomType.basePrice),
      description: roomType.description,
      amenities: Array.isArray(roomType.amenities) ? roomType.amenities as string[] : [],
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
    };

    return {
      success: true,
      message: `Tipo de habitación "${roomType.name}" creado exitosamente`,
      data,
    };
  }

  async update(id: number, updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomTypeResponse> {
    // Verificar que existe el tipo de habitación
    const existingRoomType = await this.roomTypeRepository.findById(id);
    if (!existingRoomType) {
      throw new EntityNotFoundException('tipo de habitación', id);
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateRoomTypeDto.name && updateRoomTypeDto.name !== existingRoomType.name) {
      const roomTypeWithSameName = await this.roomTypeRepository.findByName(updateRoomTypeDto.name);
      if (roomTypeWithSameName) {
        throw new BusinessRuleException({
          code: 'ROOM_TYPE_NAME_EXISTS',
          message: `Ya existe otro tipo de habitación con el nombre "${updateRoomTypeDto.name}". Cada tipo debe tener un nombre único`,
          details: { existingId: roomTypeWithSameName.id },
        });
      }
    }

    const updatedRoomType = await this.roomTypeRepository.update(id, updateRoomTypeDto);

    const data: RoomTypeData = {
      id: updatedRoomType.id,
      name: updatedRoomType.name,
      capacity: updatedRoomType.capacity,
      basePrice: Number(updatedRoomType.basePrice),
      description: updatedRoomType.description,
      amenities: Array.isArray(updatedRoomType.amenities) ? updatedRoomType.amenities as string[] : [],
      createdAt: updatedRoomType.createdAt,
      updatedAt: updatedRoomType.updatedAt,
    };

    return {
      success: true,
      message: `Tipo de habitación "${updatedRoomType.name}" actualizado exitosamente`,
      data,
    };
  }

  async remove(id: number): Promise<RoomTypeResponse> {
    // Verificar que existe el tipo de habitación
    const existingRoomType = await this.roomTypeRepository.findById(id);
    if (!existingRoomType) {
      throw new EntityNotFoundException('tipo de habitación', id);
    }

    // Verificar que no tenga habitaciones asignadas
    const hasRoomsAssigned = await this.roomTypeRepository.hasRoomsAssigned(id);
    if (hasRoomsAssigned) {
      throw new BusinessRuleException({
        code: 'ROOM_TYPE_HAS_ROOMS',
        message: `No se puede eliminar el tipo de habitación "${existingRoomType.name}" porque tiene habitaciones asignadas. Primero elimine o reasigne las habitaciones`,
        details: { roomTypeName: existingRoomType.name },
      });
    }

    await this.roomTypeRepository.softDelete(id);

    return {
      success: true,
      message: `Tipo de habitación "${existingRoomType.name}" eliminado exitosamente`,
    };
  }
}
