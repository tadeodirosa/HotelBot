import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { CustomerRepository } from './customers.repository';
import { CreateCustomerDto, UpdateCustomerDto, CustomerSearchDto } from './dto/customer.dto';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: CustomerRepository;

  const mockCustomer = {
    id: 1,
    dni: '12345678A',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@email.com',
    phone: '+1234567890',
    nationality: 'Mexican',
    dateOfBirth: '1990-01-15',
    preferences: { room: 'non-smoking', amenities: ['wifi'] },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByDni: jest.fn(),
    findAll: jest.fn(),
    findByIdWithReservations: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    checkDniExists: jest.fn(),
    checkEmailExists: jest.fn(),
    getCustomerStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: CustomerRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      const createDto: CreateCustomerDto = {
        dni: '12345678A',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '+1234567890',
        nationality: 'Mexican',
        dateOfBirth: '1990-01-15',
        preferences: { room: 'non-smoking', amenities: ['wifi'] },
      };

      mockRepository.checkDniExists.mockResolvedValue(false);
      mockRepository.checkEmailExists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockCustomer);

      const result = await service.create(createDto);

      expect(mockRepository.checkDniExists).toHaveBeenCalledWith(createDto.dni, undefined);
      expect(mockRepository.checkEmailExists).toHaveBeenCalledWith(createDto.email, undefined);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        ...mockCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });

    it('should throw ConflictException if DNI already exists', async () => {
      const createDto: CreateCustomerDto = {
        dni: '12345678A',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '+1234567890',
        nationality: 'Mexican',
        dateOfBirth: '1990-01-15',
      };

      mockRepository.checkDniExists.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto: CreateCustomerDto = {
        dni: '12345678A',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '+1234567890',
        nationality: 'Mexican',
        dateOfBirth: '1990-01-15',
      };

      mockRepository.checkDniExists.mockResolvedValue(false);
      mockRepository.checkEmailExists.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid DNI format', async () => {
      const createDto: CreateCustomerDto = {
        dni: '123',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '+1234567890',
        nationality: 'Mexican',
        dateOfBirth: '1990-01-15',
      };

      mockRepository.checkDniExists.mockResolvedValue(false);
      mockRepository.checkEmailExists.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for future birth date', async () => {
      const createDto: CreateCustomerDto = {
        dni: '12345678A',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '+1234567890',
        nationality: 'Mexican',
        dateOfBirth: '2030-01-15', // Future date
      };

      mockRepository.checkDniExists.mockResolvedValue(false);
      mockRepository.checkEmailExists.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return customer if found', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ...mockCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update customer successfully', async () => {
      const updateDto: UpdateCustomerDto = {
        firstName: 'Juan Carlos',
        phone: '+1111111111',
      };

      const updatedCustomer = { ...mockCustomer, ...updateDto };
      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({
        ...updatedCustomer,
        fullName: 'Juan Carlos Pérez',
        age: expect.any(Number),
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      const updateDto: UpdateCustomerDto = {
        firstName: 'Juan Carlos',
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if DNI already exists for another customer', async () => {
      const updateDto: UpdateCustomerDto = {
        dni: 'EXISTING123',
      };

      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.checkDniExists.mockResolvedValue(true);

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists for another customer', async () => {
      const updateDto: UpdateCustomerDto = {
        email: 'existing@email.com',
      };

      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.checkEmailExists.mockResolvedValue(true);

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete customer successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Cliente "Juan Pérez" eliminado exitosamente',
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const searchDto: CustomerSearchDto = {
        page: 1,
        limit: 10,
      };

      const searchResults = {
        customers: [mockCustomer],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockRepository.findAll.mockResolvedValue(searchResults);

      const result = await service.findAll(searchDto);

      expect(mockRepository.findAll).toHaveBeenCalledWith(searchDto);
      expect(result.customers[0]).toEqual({
        ...mockCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });
  });

  describe('getStats', () => {
    it('should return customer statistics', async () => {
      const stats = {
        totalCustomers: 10,
        totalActive: 8,
        totalInactive: 2,
        averageAge: 35,
        nationalityDistribution: [
          { nationality: 'Mexican', count: 5 },
          { nationality: 'American', count: 3 },
          { nationality: 'Canadian', count: 2 },
        ],
      };

      mockRepository.getCustomerStats.mockResolvedValue(stats);

      const result = await service.getStats();

      expect(mockRepository.getCustomerStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('findByDni', () => {
    it('should return customer if found by DNI', async () => {
      mockRepository.findByDni.mockResolvedValue(mockCustomer);

      const result = await service.findByDni('12345678A');

      expect(mockRepository.findByDni).toHaveBeenCalledWith('12345678A');
      expect(result).toEqual({
        ...mockCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });

    it('should throw NotFoundException if customer not found by DNI', async () => {
      mockRepository.findByDni.mockResolvedValue(null);

      await expect(service.findByDni('NOTFOUND')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findByDni).toHaveBeenCalledWith('NOTFOUND');
    });
  });

  describe('findByEmail', () => {
    it('should return customer if found by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail('juan@email.com');

      expect(mockRepository.findByEmail).toHaveBeenCalledWith('juan@email.com');
      expect(result).toEqual({
        ...mockCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });

    it('should throw NotFoundException if customer not found by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('notfound@email.com')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('notfound@email.com');
    });
  });

  describe('restore', () => {
    it('should restore deleted customer successfully', async () => {
      const restoredCustomer = { ...mockCustomer, isActive: true };
      mockRepository.restore.mockResolvedValue(restoredCustomer);

      const result = await service.restore(1);

      expect(mockRepository.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ...restoredCustomer,
        fullName: 'Juan Pérez',
        age: expect.any(Number),
      });
    });
  });
});
