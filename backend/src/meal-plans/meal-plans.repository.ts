import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { $Enums } from '@prisma/client';
import { IMealPlan, IMealPlanWithStats } from './interfaces/meal-plan.interface';
import { CreateMealPlanDto, UpdateMealPlanDto, MealPlanSearchDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlansRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMealPlanDto): Promise<IMealPlan> {
    const mealPlan = await this.prisma.mealPlan.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        dailyPrice: data.dailyPrice,
        features: data.features,
        isActive: data.isActive ?? true,
      },
    });

    return this.mapToInterface(mealPlan);
  }

  async findAll(searchDto?: MealPlanSearchDto): Promise<IMealPlan[]> {
    const where: any = {};

    if (searchDto?.isActive !== undefined) {
      where.isActive = searchDto.isActive;
    }

    if (searchDto?.type) {
      where.type = searchDto.type;
    }

    if (searchDto?.search) {
      where.OR = [
        {
          name: {
            contains: searchDto.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (searchDto?.minPrice !== undefined) {
      where.dailyPrice = {
        ...where.dailyPrice,
        gte: searchDto.minPrice,
      };
    }

    if (searchDto?.maxPrice !== undefined) {
      where.dailyPrice = {
        ...where.dailyPrice,
        lte: searchDto.maxPrice,
      };
    }

    const mealPlans = await this.prisma.mealPlan.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return mealPlans.map(this.mapToInterface);
  }

  async findById(id: number): Promise<IMealPlan | null> {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
    });

    return mealPlan ? this.mapToInterface(mealPlan) : null;
  }

  async findByName(name: string): Promise<IMealPlan | null> {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { name },
    });

    return mealPlan ? this.mapToInterface(mealPlan) : null;
  }

  async update(id: number, data: UpdateMealPlanDto): Promise<IMealPlan> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.dailyPrice !== undefined) updateData.dailyPrice = data.dailyPrice;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const mealPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: updateData,
    });

    return this.mapToInterface(mealPlan);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  async findWithStats(searchDto?: MealPlanSearchDto): Promise<IMealPlanWithStats[]> {
    const where: any = {};

    if (searchDto?.isActive !== undefined) {
      where.isActive = searchDto.isActive;
    }

    if (searchDto?.type) {
      where.type = searchDto.type;
    }

    const mealPlans = await this.prisma.mealPlan.findMany({
      where,
      include: {
        reservations: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return mealPlans.map((mealPlan) => {
      const baseMealPlan = this.mapToInterface(mealPlan);
      const totalReservations = mealPlan.reservations.length;
      const averageRevenue = totalReservations > 0
        ? mealPlan.reservations.reduce((sum, reservation) => 
            sum + Number(reservation.totalAmount), 0) / totalReservations
        : 0;

      return {
        ...baseMealPlan,
        totalReservations,
        averageRevenue,
      };
    });
  }

  async findByType(type: $Enums.MealPlanType): Promise<IMealPlan[]> {
    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { type },
      orderBy: {
        dailyPrice: 'asc',
      },
    });

    return mealPlans.map(this.mapToInterface);
  }

  async getActiveCount(): Promise<number> {
    return this.prisma.mealPlan.count({
      where: { isActive: true },
    });
  }

  async getPriceRange(): Promise<{ min: number; max: number }> {
    const result = await this.prisma.mealPlan.aggregate({
      where: { isActive: true },
      _min: { dailyPrice: true },
      _max: { dailyPrice: true },
    });

    return {
      min: Number(result._min.dailyPrice) || 0,
      max: Number(result._max.dailyPrice) || 0,
    };
  }

  async getTypeDistribution(): Promise<Array<{ type: $Enums.MealPlanType; count: number }>> {
    const distribution = await this.prisma.mealPlan.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { isActive: true },
    });

    return distribution.map((item) => ({
      type: item.type,
      count: item._count.type,
    }));
  }

  async findMostPopular(limit: number = 5): Promise<IMealPlanWithStats[]> {
    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { isActive: true },
      include: {
        reservations: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const mealPlansWithStats = mealPlans.map((mealPlan) => {
      const baseMealPlan = this.mapToInterface(mealPlan);
      const totalReservations = mealPlan.reservations.length;
      const averageRevenue = totalReservations > 0
        ? mealPlan.reservations.reduce((sum, reservation) => 
            sum + Number(reservation.totalAmount), 0) / totalReservations
        : 0;

      return {
        ...baseMealPlan,
        totalReservations,
        averageRevenue,
      };
    });

    return mealPlansWithStats
      .sort((a, b) => (b.totalReservations || 0) - (a.totalReservations || 0))
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        popularityRank: index + 1,
      }));
  }

  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    const result = await this.prisma.mealPlan.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isActive,
      },
    });

    return result.count;
  }

  private mapToInterface(mealPlan: any): IMealPlan {
    return {
      id: mealPlan.id,
      name: mealPlan.name,
      description: mealPlan.description,
      type: mealPlan.type,
      dailyPrice: Number(mealPlan.dailyPrice),
      features: Array.isArray(mealPlan.features) ? mealPlan.features : [],
      isActive: mealPlan.isActive,
      createdAt: mealPlan.createdAt,
      updatedAt: mealPlan.updatedAt,
    };
  }
}
