import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { RoomType } from '@prisma/client';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';

@Injectable()
export class RoomTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RoomType[]> {
    return this.prisma.roomType.findMany(
      this.prisma.excludeDeleted({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      }),
    );
  }

  async findById(id: number): Promise<RoomType | null> {
    return this.prisma.roomType.findFirst(
      this.prisma.excludeDeleted({
        where: { id },
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      }),
    );
  }

  async findByName(name: string): Promise<RoomType | null> {
    return this.prisma.roomType.findFirst(
      this.prisma.excludeDeleted({
        where: { name },
      }),
    );
  }

  async create(data: CreateRoomTypeDto): Promise<RoomType> {
    return this.prisma.roomType.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        basePrice: data.basePrice,
        description: data.description,
        amenities: data.amenities || [],
      },
    });
  }

  async update(id: number, data: UpdateRoomTypeDto): Promise<RoomType> {
    return this.prisma.roomType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.amenities && { amenities: data.amenities }),
      },
    });
  }

  async softDelete(id: number): Promise<RoomType> {
    return this.prisma.roomType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hasRoomsAssigned(id: number): Promise<boolean> {
    const count = await this.prisma.room.count({
      where: {
        roomTypeId: id,
        deletedAt: null,
      },
    });
    return count > 0;
  }
}
