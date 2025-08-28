import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { Customer } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto, CustomerSearchDto } from './dto/customer.dto';
import { ICustomerSearchResult, ICustomerWithReservations } from './interfaces/customer.interface';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(searchDto?: CustomerSearchDto): Promise<ICustomerSearchResult> {
    const page = searchDto?.page || 1;
    const limit = Math.min(searchDto?.limit || 10, 100); // Máximo 100 por página
    const skip = (page - 1) * limit;

    const whereClause: any = this.prisma.excludeDeleted({}).where;

    // Construir filtros de búsqueda
    if (searchDto?.name) {
      whereClause.OR = [
        {
          firstName: {
            contains: searchDto.name,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchDto.name,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (searchDto?.dni) {
      whereClause.dni = {
        contains: searchDto.dni,
        mode: 'insensitive',
      };
    }

    if (searchDto?.email) {
      whereClause.email = {
        contains: searchDto.email,
        mode: 'insensitive',
      };
    }

    // Ejecutar consultas en paralelo para mejor performance
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dni: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          nationality: true,
          preferences: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.customer.count({ where: whereClause }),
    ]);

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Customer | null> {
    return this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: { id },
      }),
    );
  }

  async findByIdWithReservations(id: number): Promise<ICustomerWithReservations | null> {
    // Por ahora simplificamos esta consulta ya que las reservas se implementarán más adelante
    const customer = await this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: { id },
      }),
    );

    if (!customer) return null;

    // Preparamos la estructura para cuando implementemos las reservas
    return {
      ...customer,
      reservations: [],
      totalReservations: 0,
      totalSpent: 0,
    };
  }

  async findByDni(dni: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: { dni },
      }),
    );
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: { email },
      }),
    );
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dni: data.dni,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        nationality: data.nationality,
        preferences: data.preferences || {},
      },
    });
  }

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.dni) updateData.dni = data.dni;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.nationality) updateData.nationality = data.nationality;
    if (data.preferences) updateData.preferences = data.preferences;

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  async softDelete(id: number): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: number): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  async getCustomerStats(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Estadísticas en paralelo para mejor performance
    const [
      totalCustomers,
      newCustomersThisMonth,
      nationalityStats,
    ] = await Promise.all([
      this.prisma.customer.count(this.prisma.excludeDeleted({})),
      this.prisma.customer.count(
        this.prisma.excludeDeleted({
          where: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
      ),
      this.prisma.customer.groupBy({
        by: ['nationality'],
        where: this.prisma.excludeDeleted({}).where,
        _count: {
          nationality: true,
        },
        orderBy: {
          _count: {
            nationality: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    return {
      totalCustomers,
      newCustomersThisMonth,
      topNationalities: nationalityStats.map(stat => ({
        nationality: stat.nationality || 'No especificada',
        count: stat._count.nationality,
      })),
    };
  }

  async checkDniExists(dni: string, excludeId?: number): Promise<boolean> {
    const customer = await this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: {
          dni,
          ...(excludeId && { id: { not: excludeId } }),
        },
      }),
    );
    return !!customer;
  }

  async checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
    const customer = await this.prisma.customer.findFirst(
      this.prisma.excludeDeleted({
        where: {
          email,
          ...(excludeId && { id: { not: excludeId } }),
        },
      }),
    );
    return !!customer;
  }
}
