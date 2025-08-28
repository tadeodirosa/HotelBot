import { Injectable } from '@nestjs/common';
import { RoomRepository } from './rooms.repository';
import { RoomTypeRepository } from '../room-types/room-types.repository';
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from './dto/room.dto';
import { RoomResponse, RoomListResponse, RoomData } from './interfaces/room.interface';
import { BusinessRuleException, EntityNotFoundException } from '../shared/exceptions/business.exception';

@Injectable()
export class RoomsService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly roomTypeRepository: RoomTypeRepository,
  ) {}

  async findAll(): Promise<RoomListResponse> {
    const rooms = await this.roomRepository.findAll();
    
    const data: RoomData[] = rooms.map(room => ({
      id: room.id,
      name: room.name,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: (room as any).roomType.id,
        name: (room as any).roomType.name,
        capacity: (room as any).roomType.capacity,
        basePrice: Number((room as any).roomType.basePrice),
      },
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      hasActiveReservations: ((room as any)._count?.reservations || 0) > 0,
    }));

    return {
      success: true,
      message: `Se encontraron ${data.length} habitaciones en el sistema`,
      data,
    };
  }

  async findOne(id: number): Promise<RoomResponse> {
    const room = await this.roomRepository.findById(id);
    
    if (!room) {
      throw new EntityNotFoundException('habitación', id);
    }

    const data: RoomData = {
      id: room.id,
      name: room.name,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: (room as any).roomType.id,
        name: (room as any).roomType.name,
        capacity: (room as any).roomType.capacity,
        basePrice: Number((room as any).roomType.basePrice),
      },
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      hasActiveReservations: ((room as any)._count?.reservations || 0) > 0,
    };

    return {
      success: true,
      message: 'Habitación encontrada exitosamente',
      data,
    };
  }

  async create(createRoomDto: CreateRoomDto): Promise<RoomResponse> {
    // Validar que no existe una habitación con el mismo nombre
    const existingRoom = await this.roomRepository.findByName(createRoomDto.name);
    if (existingRoom) {
      throw new BusinessRuleException({
        code: 'ROOM_NAME_EXISTS',
        message: `Ya existe una habitación con el nombre "${createRoomDto.name}". Cada habitación debe tener un nombre único`,
        details: { existingId: existingRoom.id },
      });
    }

    // Validar que existe el tipo de habitación
    const roomType = await this.roomTypeRepository.findById(createRoomDto.roomTypeId);
    if (!roomType) {
      throw new BusinessRuleException({
        code: 'ROOM_TYPE_NOT_FOUND',
        message: `No existe un tipo de habitación con el ID ${createRoomDto.roomTypeId}. Seleccione un tipo de habitación válido`,
        details: { roomTypeId: createRoomDto.roomTypeId },
      });
    }

    const room = await this.roomRepository.create(createRoomDto);

    const data: RoomData = {
      id: room.id,
      name: room.name,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: (room as any).roomType.id,
        name: (room as any).roomType.name,
        capacity: (room as any).roomType.capacity,
        basePrice: Number((room as any).roomType.basePrice),
      },
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };

    return {
      success: true,
      message: `Habitación "${room.name}" creada exitosamente`,
      data,
    };
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<RoomResponse> {
    // Verificar que existe la habitación
    const existingRoom = await this.roomRepository.findById(id);
    if (!existingRoom) {
      throw new EntityNotFoundException('habitación', id);
    }

    // Si se está actualizando el nombre, verificar que no exista otra con ese nombre
    if (updateRoomDto.name && updateRoomDto.name !== existingRoom.name) {
      const roomWithSameName = await this.roomRepository.findByName(updateRoomDto.name);
      if (roomWithSameName) {
        throw new BusinessRuleException({
          code: 'ROOM_NAME_EXISTS',
          message: `Ya existe otra habitación con el nombre "${updateRoomDto.name}". Cada habitación debe tener un nombre único`,
          details: { existingId: roomWithSameName.id },
        });
      }
    }

    // Si se está actualizando el tipo, verificar que existe
    if (updateRoomDto.roomTypeId) {
      const roomType = await this.roomTypeRepository.findById(updateRoomDto.roomTypeId);
      if (!roomType) {
        throw new BusinessRuleException({
          code: 'ROOM_TYPE_NOT_FOUND',
          message: `No existe un tipo de habitación con el ID ${updateRoomDto.roomTypeId}. Seleccione un tipo de habitación válido`,
          details: { roomTypeId: updateRoomDto.roomTypeId },
        });
      }
    }

    const updatedRoom = await this.roomRepository.update(id, updateRoomDto);

    const data: RoomData = {
      id: updatedRoom.id,
      name: updatedRoom.name,
      floor: updatedRoom.floor,
      status: updatedRoom.status,
      roomType: {
        id: (updatedRoom as any).roomType.id,
        name: (updatedRoom as any).roomType.name,
        capacity: (updatedRoom as any).roomType.capacity,
        basePrice: Number((updatedRoom as any).roomType.basePrice),
      },
      createdAt: updatedRoom.createdAt,
      updatedAt: updatedRoom.updatedAt,
    };

    return {
      success: true,
      message: `Habitación "${updatedRoom.name}" actualizada exitosamente`,
      data,
    };
  }

  async updateStatus(id: number, updateStatusDto: UpdateRoomStatusDto): Promise<RoomResponse> {
    // Verificar que existe la habitación
    const existingRoom = await this.roomRepository.findById(id);
    if (!existingRoom) {
      throw new EntityNotFoundException('habitación', id);
    }

    // Validaciones de cambio de estado
    if (updateStatusDto.status === 'maintenance' || updateStatusDto.status === 'out_of_order') {
      const hasActiveReservations = await this.roomRepository.hasActiveReservations(id);
      if (hasActiveReservations) {
        throw new BusinessRuleException({
          code: 'ROOM_HAS_ACTIVE_RESERVATIONS',
          message: `No se puede cambiar el estado de la habitación "${existingRoom.name}" a "${updateStatusDto.status}" porque tiene reservas activas. Cancele o complete las reservas primero`,
          details: { roomName: existingRoom.name, newStatus: updateStatusDto.status },
        });
      }
    }

    const updatedRoom = await this.roomRepository.updateStatus(id, updateStatusDto.status);

    const data: RoomData = {
      id: updatedRoom.id,
      name: updatedRoom.name,
      floor: updatedRoom.floor,
      status: updatedRoom.status,
      roomType: {
        id: (updatedRoom as any).roomType.id,
        name: (updatedRoom as any).roomType.name,
        capacity: (updatedRoom as any).roomType.capacity,
        basePrice: Number((updatedRoom as any).roomType.basePrice),
      },
      createdAt: updatedRoom.createdAt,
      updatedAt: updatedRoom.updatedAt,
    };

    return {
      success: true,
      message: `Estado de la habitación "${updatedRoom.name}" cambiado a "${updateStatusDto.status}" exitosamente`,
      data,
    };
  }

  async remove(id: number): Promise<RoomResponse> {
    // Verificar que existe la habitación
    const existingRoom = await this.roomRepository.findById(id);
    if (!existingRoom) {
      throw new EntityNotFoundException('habitación', id);
    }

    // Verificar que no tenga reservas activas
    const hasActiveReservations = await this.roomRepository.hasActiveReservations(id);
    if (hasActiveReservations) {
      throw new BusinessRuleException({
        code: 'ROOM_HAS_ACTIVE_RESERVATIONS',
        message: `No se puede eliminar la habitación "${existingRoom.name}" porque tiene reservas activas. Cancele o complete las reservas primero`,
        details: { roomName: existingRoom.name },
      });
    }

    await this.roomRepository.softDelete(id);

    return {
      success: true,
      message: `Habitación "${existingRoom.name}" eliminada exitosamente`,
    };
  }
}
