import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Room, RoomStatus } from '@prisma/client';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    return this.prisma.room.findMany(
      this.prisma.excludeDeleted({
        orderBy: { name: 'asc' },
        include: {
          roomType: {
            select: {
              id: true,
              name: true,
              capacity: true,
              basePrice: true,
            },
          },
          _count: {
            select: {
              reservations: {
                where: {
                  status: {
                    in: ['PENDING', 'CONFIRMED'],
                  },
                },
              },
            },
          },
        },
      }),
    );
  }

  async findById(id: number): Promise<Room | null> {
    return this.prisma.room.findFirst(
      this.prisma.excludeDeleted({
        where: { id },
        include: {
          roomType: {
            select: {
              id: true,
              name: true,
              capacity: true,
              basePrice: true,
            },
          },
          _count: {
            select: {
              reservations: {
                where: {
                  status: {
                    in: ['PENDING', 'CONFIRMED'],
                  },
                },
              },
            },
          },
        },
      }),
    );
  }

  async findByName(name: string): Promise<Room | null> {
    return this.prisma.room.findFirst(
      this.prisma.excludeDeleted({
        where: { name },
      }),
    );
  }

  async findByRoomType(roomTypeId: number): Promise<Room[]> {
    return this.prisma.room.findMany(
      this.prisma.excludeDeleted({
        where: { roomTypeId },
        orderBy: { name: 'asc' },
      }),
    );
  }

  async create(data: CreateRoomDto): Promise<Room> {
    return this.prisma.room.create({
      data: {
        name: data.name,
        roomTypeId: data.roomTypeId,
        floor: data.floor,
        status: data.status ? data.status.toUpperCase() as RoomStatus : RoomStatus.AVAILABLE,
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            basePrice: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateRoomDto): Promise<Room> {
    return this.prisma.room.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.roomTypeId && { roomTypeId: data.roomTypeId }),
        ...(data.floor !== undefined && { floor: data.floor }),
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            basePrice: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, status: string): Promise<Room> {
    return this.prisma.room.update({
      where: { id },
      data: { status: status as any },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            capacity: true,
            basePrice: true,
          },
        },
      },
    });
  }

  async softDelete(id: number): Promise<Room> {
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hasActiveReservations(id: number): Promise<boolean> {
    const count = await this.prisma.reservation.count({
      where: {
        roomId: id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });
    return count > 0;
  }
}
