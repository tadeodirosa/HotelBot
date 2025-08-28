import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto, UpdateMealPlanDto, MealPlanSearchDto } from './dto/meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('meal-plans')
@Controller('meal-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo plan de comida',
    description: 'Crea un nuevo plan de comida con validaciones de negocio'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Plan de comida creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Plan de comida "Desayuno Buffet Premium" creado exitosamente',
        data: {
          id: 1,
          name: 'Desayuno Buffet Premium',
          description: 'Desayuno buffet completo con opciones internacionales',
          type: 'BREAKFAST',
          dailyPrice: 25.99,
          features: ['Buffet internacional', 'Frutas frescas', 'Bebidas calientes'],
          isActive: true,
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
        message: 'Ya existe un plan de comida con el nombre "Desayuno Buffet Premium"',
        errors: ['Nombre duplicado']
      }
    }
  })
  async create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los planes de comida',
    description: 'Lista todos los planes de comida con paginación y filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de planes de comida obtenida exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Se encontraron 3 planes de comida en el sistema',
        data: {
          mealPlans: [
            {
              id: 1,
              name: 'Desayuno Buffet Premium',
              description: 'Desayuno buffet completo',
              type: 'BREAKFAST',
              dailyPrice: 25.99,
              features: ['Buffet internacional', 'Frutas frescas'],
              isActive: true,
              createdAt: '2025-08-27T20:00:00.000Z',
              updatedAt: '2025-08-27T20:00:00.000Z'
            }
          ],
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    }
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.mealPlansService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener plan de comida por ID',
    description: 'Obtiene los detalles completos de un plan de comida específico'
  })
  @ApiParam({ name: 'id', description: 'ID del plan de comida', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan de comida encontrado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plan de comida no encontrado',
    schema: {
      example: {
        success: false,
        message: 'No se encontró plan de comida con el identificador 1',
        errors: ['Plan de comida no encontrado']
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlansService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar plan de comida',
    description: 'Actualiza parcialmente un plan de comida existente'
  })
  @ApiParam({ name: 'id', description: 'ID del plan de comida', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan de comida actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plan de comida no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error de validación o regla de negocio' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateMealPlanDto: UpdateMealPlanDto
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ 
    summary: 'Activar plan de comida',
    description: 'Marca un plan de comida como activo'
  })
  @ApiParam({ name: 'id', description: 'ID del plan de comida', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan de comida activado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plan de comida no encontrado' 
  })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlansService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Desactivar plan de comida',
    description: 'Marca un plan de comida como inactivo'
  })
  @ApiParam({ name: 'id', description: 'ID del plan de comida', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Plan de comida desactivado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Plan de comida no encontrado' 
  })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlansService.deactivate(id);
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de planes de comida',
    description: 'Obtiene estadísticas generales de los planes de comida'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Estadísticas de planes de comida calculadas exitosamente',
        data: {
          totalMealPlans: 5,
          totalActive: 4,
          totalInactive: 1,
          averagePrice: 45.75,
          priceRange: {
            min: 15.00,
            max: 125.99
          }
        }
      }
    }
  })
  async getStatistics() {
    return this.mealPlansService.getStatistics();
  }
}
