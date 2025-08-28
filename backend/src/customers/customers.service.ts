import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomerRepository } from './customers.repository';
import { CreateCustomerDto, UpdateCustomerDto, CustomerSearchDto } from './dto/customer.dto';
import { ICustomer, ICustomerSearchResult, ICustomerWithReservations } from './interfaces/customer.interface';

@Injectable()
export class CustomersService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async findAll(searchDto?: CustomerSearchDto): Promise<ICustomerSearchResult> {
    const result = await this.customerRepository.findAll(searchDto);
    
    // Enriquecer los datos de los clientes con información calculada
    const enrichedCustomers = result.customers.map(customer => ({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    }));

    return {
      ...result,
      customers: enrichedCustomers,
    };
  }

  async findById(id: number): Promise<ICustomer> {
    const customer = await this.customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async findByIdWithReservations(id: number): Promise<ICustomerWithReservations> {
    const customer = await this.customerRepository.findByIdWithReservations(id);
    
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<ICustomer> {
    // Validaciones de negocio
    await this.validateUniqueConstraints(createCustomerDto.dni, createCustomerDto.email);
    
    // Validar formato de DNI (personalizable según país)
    this.validateDniFormat(createCustomerDto.dni);
    
    // Validar edad si se proporciona fecha de nacimiento
    if (createCustomerDto.dateOfBirth) {
      this.validateAge(createCustomerDto.dateOfBirth);
    }

    const customer = await this.customerRepository.create(createCustomerDto);
    
    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<ICustomer> {
    // Verificar que el cliente existe
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Validaciones de negocio para campos únicos si se están actualizando
    if (updateCustomerDto.dni || updateCustomerDto.email) {
      await this.validateUniqueConstraints(
        updateCustomerDto.dni,
        updateCustomerDto.email,
        id,
      );
    }

    // Validar formato de DNI si se está actualizando
    if (updateCustomerDto.dni) {
      this.validateDniFormat(updateCustomerDto.dni);
    }

    // Validar edad si se está actualizando la fecha de nacimiento
    if (updateCustomerDto.dateOfBirth) {
      this.validateAge(updateCustomerDto.dateOfBirth);
    }

    const customer = await this.customerRepository.update(id, updateCustomerDto);
    
    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // TODO: Validar que no tenga reservas activas antes de eliminar
    // Esta validación se implementará cuando tengamos el módulo de reservas

    await this.customerRepository.softDelete(id);
    
    return {
      message: `Cliente "${customer.firstName} ${customer.lastName}" eliminado exitosamente`,
    };
  }

  async restore(id: number): Promise<ICustomer> {
    const customer = await this.customerRepository.restore(id);
    
    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async getStats(): Promise<any> {
    return await this.customerRepository.getCustomerStats();
  }

  async findByDni(dni: string): Promise<ICustomer> {
    const customer = await this.customerRepository.findByDni(dni);
    
    if (!customer) {
      throw new NotFoundException(`Cliente con DNI ${dni} no encontrado`);
    }

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  async findByEmail(email: string): Promise<ICustomer> {
    const customer = await this.customerRepository.findByEmail(email);
    
    if (!customer) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`);
    }

    return {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      age: customer.dateOfBirth ? this.calculateAge(customer.dateOfBirth) : null,
    };
  }

  // Métodos privados para validaciones de negocio
  private async validateUniqueConstraints(dni?: string, email?: string, excludeId?: number): Promise<void> {
    if (dni) {
      const dniExists = await this.customerRepository.checkDniExists(dni, excludeId);
      if (dniExists) {
        throw new ConflictException(`Ya existe un cliente con el DNI ${dni}`);
      }
    }

    if (email) {
      const emailExists = await this.customerRepository.checkEmailExists(email, excludeId);
      if (emailExists) {
        throw new ConflictException(`Ya existe un cliente con el email ${email}`);
      }
    }
  }

  private validateDniFormat(dni: string): void {
    // Validación básica de DNI - se puede personalizar según el país
    const dniRegex = /^[0-9A-Z]{5,20}$/i;
    if (!dniRegex.test(dni)) {
      throw new BadRequestException(
        'El formato del DNI no es válido. Debe contener entre 5 y 20 caracteres alfanuméricos'
      );
    }
  }

  private validateAge(dateOfBirth: string): void {
    const birthDate = new Date(dateOfBirth);
    const age = this.calculateAge(birthDate);

    if (age < 0) {
      throw new BadRequestException('La fecha de nacimiento no puede ser en el futuro');
    }

    if (age > 150) {
      throw new BadRequestException('La fecha de nacimiento no puede indicar una edad mayor a 150 años');
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
