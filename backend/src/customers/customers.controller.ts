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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerSearchDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse as ApiResponseInterface } from '../shared/interfaces/api-response.interface';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo cliente',
    description: 'Crea un nuevo cliente en el sistema con validaciones completas de negocio',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Cliente "Juan Carlos García López" creado exitosamente',
        data: {
          id: 1,
          firstName: 'Juan Carlos',
          lastName: 'García López',
          dni: '12345678A',
          email: 'juan.garcia@email.com',
          phone: '+34 666 123 456',
          dateOfBirth: '1985-06-15T00:00:00.000Z',
          nationality: 'Española',
          preferences: {
            roomPreferences: {
              floor: 'high',
              view: 'sea',
              bedType: 'king'
            }
          },
          fullName: 'Juan Carlos García López',
          age: 38,
          createdAt: '2025-08-27T10:00:00.000Z',
          updatedAt: '2025-08-27T10:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'DNI o email ya existe en el sistema',
  })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<ApiResponseInterface> {
    const customer = await this.customersService.create(createCustomerDto);
    return {
      success: true,
      message: `Cliente "${customer.fullName}" creado exitosamente`,
      data: customer,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes con búsqueda y paginación',
    description: 'Obtiene una lista paginada de clientes con opciones de búsqueda avanzada',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Buscar por nombre o apellido',
    example: 'Juan',
  })
  @ApiQuery({
    name: 'dni',
    required: false,
    description: 'Buscar por DNI',
    example: '12345678A',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Buscar por email',
    example: 'juan@email.com',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página (máximo 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Se encontraron 25 clientes en el sistema',
        data: {
          customers: [
            {
              id: 1,
              firstName: 'Juan Carlos',
              lastName: 'García López',
              dni: '12345678A',
              email: 'juan.garcia@email.com',
              phone: '+34 666 123 456',
              fullName: 'Juan Carlos García López',
              age: 38,
              nationality: 'Española'
            }
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    }
  })
  async findAll(@Query() searchDto: CustomerSearchDto): Promise<ApiResponseInterface> {
    const result = await this.customersService.findAll(searchDto);
    return {
      success: true,
      message: `Se encontraron ${result.total} clientes en el sistema`,
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de clientes',
    description: 'Obtiene estadísticas generales sobre los clientes del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Estadísticas de clientes obtenidas exitosamente',
        data: {
          totalCustomers: 150,
          newCustomersThisMonth: 12,
          topNationalities: [
            { nationality: 'Española', count: 45 },
            { nationality: 'Francesa', count: 23 },
            { nationality: 'Alemana', count: 18 }
          ]
        }
      }
    }
  })
  async getStats(): Promise<ApiResponseInterface> {
    const stats = await this.customersService.getStats();
    return {
      success: true,
      message: 'Estadísticas de clientes obtenidas exitosamente',
      data: stats,
    };
  }

  @Get('search/dni/:dni')
  @ApiOperation({
    summary: 'Buscar cliente por DNI',
    description: 'Busca un cliente específico utilizando su documento de identidad',
  })
  @ApiParam({
    name: 'dni',
    description: 'Documento de identidad del cliente',
    example: '12345678A',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async findByDni(@Param('dni') dni: string): Promise<ApiResponseInterface> {
    const customer = await this.customersService.findByDni(dni);
    return {
      success: true,
      message: `Cliente con DNI ${dni} encontrado exitosamente`,
      data: customer,
    };
  }

  @Get('search/email/:email')
  @ApiOperation({
    summary: 'Buscar cliente por email',
    description: 'Busca un cliente específico utilizando su dirección de correo electrónico',
  })
  @ApiParam({
    name: 'email',
    description: 'Dirección de email del cliente',
    example: 'juan.garcia@email.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async findByEmail(@Param('email') email: string): Promise<ApiResponseInterface> {
    const customer = await this.customersService.findByEmail(email);
    return {
      success: true,
      message: `Cliente con email ${email} encontrado exitosamente`,
      data: customer,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cliente por ID',
    description: 'Obtiene la información completa de un cliente específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseInterface> {
    const customer = await this.customersService.findById(id);
    return {
      success: true,
      message: 'Cliente encontrado exitosamente',
      data: customer,
    };
  }

  @Get(':id/reservations')
  @ApiOperation({
    summary: 'Obtener cliente con historial de reservas',
    description: 'Obtiene la información del cliente junto con su historial de reservas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente con reservas encontrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async findOneWithReservations(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseInterface> {
    const customer = await this.customersService.findByIdWithReservations(id);
    return {
      success: true,
      message: 'Cliente con historial de reservas encontrado exitosamente',
      data: customer,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar cliente',
    description: 'Actualiza la información de un cliente existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'DNI o email ya existe en el sistema',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ApiResponseInterface> {
    const customer = await this.customersService.update(id, updateCustomerDto);
    return {
      success: true,
      message: `Cliente "${customer.fullName}" actualizado exitosamente`,
      data: customer,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar cliente (soft delete)',
    description: 'Realiza una eliminación lógica del cliente, manteniendo los datos para auditoría',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseInterface> {
    const result = await this.customersService.remove(id);
    return {
      success: true,
      message: result.message,
      data: null,
    };
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar cliente eliminado',
    description: 'Restaura un cliente que fue eliminado lógicamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente restaurado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async restore(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseInterface> {
    const customer = await this.customersService.restore(id);
    return {
      success: true,
      message: `Cliente "${customer.firstName} ${customer.lastName}" restaurado exitosamente`,
      data: customer,
    };
  }
}
