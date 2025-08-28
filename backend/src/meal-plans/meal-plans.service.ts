import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto) {
    // Verificar si ya existe un plan con el mismo nombre
    const existingPlan = await this.prisma.mealPlan.findFirst({
      where: { name: createMealPlanDto.name },
    });

    if (existingPlan) {
      throw new ConflictException(`Ya existe un plan de comida con el nombre "${createMealPlanDto.name}"`);
    }

    const mealPlan = await this.prisma.mealPlan.create({
      data: {
        name: createMealPlanDto.name,
        description: createMealPlanDto.description,
        type: createMealPlanDto.type,
        dailyPrice: createMealPlanDto.dailyPrice,
        features: createMealPlanDto.features || [],
      },
    });

    return {
      success: true,
      message: `Plan de comida "${mealPlan.name}" creado exitosamente`,
      data: {
        id: mealPlan.id,
        name: mealPlan.name,
        description: mealPlan.description,
        type: mealPlan.type,
        dailyPrice: Number(mealPlan.dailyPrice),
        features: Array.isArray(mealPlan.features) ? mealPlan.features : [],
        isActive: mealPlan.isActive,
        createdAt: mealPlan.createdAt,
        updatedAt: mealPlan.updatedAt,
      },
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [mealPlans, total] = await Promise.all([
      this.prisma.mealPlan.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.mealPlan.count(),
    ]);

    const formattedPlans = mealPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      type: plan.type,
      dailyPrice: Number(plan.dailyPrice),
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));

    return {
      success: true,
      message: `Se encontraron ${total} planes de comida en el sistema`,
      data: {
        mealPlans: formattedPlans,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!mealPlan) {
      throw new NotFoundException(`No se encontró plan de comida con el identificador ${id}`);
    }

    return {
      success: true,
      message: `Plan de comida "${mealPlan.name}" encontrado exitosamente`,
      data: {
        id: mealPlan.id,
        name: mealPlan.name,
        description: mealPlan.description,
        type: mealPlan.type,
        dailyPrice: Number(mealPlan.dailyPrice),
        features: Array.isArray(mealPlan.features) ? mealPlan.features : [],
        isActive: mealPlan.isActive,
        createdAt: mealPlan.createdAt,
        updatedAt: mealPlan.updatedAt,
      },
    };
  }

  async update(id: number, updateMealPlanDto: UpdateMealPlanDto) {
    // Verificar que el plan existe
    const existingPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException(`No se encontró plan de comida con el identificador ${id}`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateMealPlanDto.name && updateMealPlanDto.name !== existingPlan.name) {
      const duplicatePlan = await this.prisma.mealPlan.findFirst({
        where: { 
          name: updateMealPlanDto.name,
          id: { not: id },
        },
      });

      if (duplicatePlan) {
        throw new ConflictException(`Ya existe otro plan de comida con el nombre "${updateMealPlanDto.name}"`);
      }
    }

    const updatedPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: updateMealPlanDto,
    });

    return {
      success: true,
      message: `Plan de comida "${updatedPlan.name}" actualizado exitosamente`,
      data: {
        id: updatedPlan.id,
        name: updatedPlan.name,
        description: updatedPlan.description,
        type: updatedPlan.type,
        dailyPrice: Number(updatedPlan.dailyPrice),
        features: Array.isArray(updatedPlan.features) ? updatedPlan.features : [],
        isActive: updatedPlan.isActive,
        createdAt: updatedPlan.createdAt,
        updatedAt: updatedPlan.updatedAt,
      },
    };
  }

  async activate(id: number) {
    const existingPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException(`No se encontró plan de comida con el identificador ${id}`);
    }
    
    const activatedPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: { isActive: true },
    });

    return {
      success: true,
      message: `Plan de comida "${activatedPlan.name}" activado exitosamente`,
      data: {
        id: activatedPlan.id,
        name: activatedPlan.name,
        isActive: activatedPlan.isActive,
        updatedAt: activatedPlan.updatedAt,
      },
    };
  }

  async deactivate(id: number) {
    const existingPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException(`No se encontró plan de comida con el identificador ${id}`);
    }
    
    const deactivatedPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: `Plan de comida "${deactivatedPlan.name}" desactivado exitosamente`,
      data: {
        id: deactivatedPlan.id,
        name: deactivatedPlan.name,
        isActive: deactivatedPlan.isActive,
        updatedAt: deactivatedPlan.updatedAt,
      },
    };
  }

  async getStatistics() {
    const [
      totalActive,
      totalInactive,
      priceStats,
    ] = await Promise.all([
      this.prisma.mealPlan.count({ where: { isActive: true } }),
      this.prisma.mealPlan.count({ where: { isActive: false } }),
      this.prisma.mealPlan.aggregate({
        _avg: { dailyPrice: true },
        _min: { dailyPrice: true },
        _max: { dailyPrice: true },
      }),
    ]);

    return {
      success: true,
      message: 'Estadísticas de planes de comida calculadas exitosamente',
      data: {
        totalMealPlans: totalActive + totalInactive,
        totalActive,
        totalInactive,
        averagePrice: Number(priceStats._avg.dailyPrice) || 0,
        priceRange: {
          min: Number(priceStats._min.dailyPrice) || 0,
          max: Number(priceStats._max.dailyPrice) || 0,
        },
      },
    };
  }
}
