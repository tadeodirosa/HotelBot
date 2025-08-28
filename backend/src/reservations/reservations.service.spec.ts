import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsRepository } from './reservations.repository';
import { PrismaService } from '../config/prisma.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { ReservationStatus } from './interfaces/reservation.enums';
import { DateValidationUtils } from './validators/date.validators';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: ReservationsRepository;
  let prisma: PrismaService;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findAll: jest.fn(),
    findOverlappingReservations: jest.fn(),
    findAvailableRooms: jest.fn(),
    isCodeUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCustomer: jest.fn(),
  };

  const mockPrisma = {
    customer: {
      findUnique: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
    mealPlan: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: ReservationsRepository,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<ReservationsRepository>(ReservationsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createReservationDto: CreateReservationDto = {
      reservationCode: 'RSV-TEST-001',
      customerId: 1,
      roomId: 1,
      checkInDate: '2025-09-01',
      checkOutDate: '2025-09-05',
      guestCount: 2,
    };

    const mockReservation = {
      id: 1,
      ...createReservationDto,
      checkInDate: new Date('2025-09-01'),
      checkOutDate: new Date('2025-09-05'),
      totalAmount: 600,
      status: ReservationStatus.PENDING,
    };

    const mockCustomer = {
      id: 1,
      firstName: 'Juan',
      lastName: 'García',
      dateOfBirth: new Date('1990-01-01'),
    };

    const mockRoom = {
      id: 1,
      name: 'Habitación 101',
      status: 'AVAILABLE',
      roomType: {
        id: 1,
        name: 'Suite Deluxe',
        capacity: 4,
        basePrice: 150,
      },
    };

    beforeEach(() => {
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.findOverlappingReservations.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue(mockReservation);
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    });

    it('should create a reservation successfully', async () => {
      const result = await service.create(createReservationDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReservation);
      expect(result.message).toBe('Reserva creada exitosamente');
      expect(mockRepository.create).toHaveBeenCalledWith(createReservationDto);
    });

    it('should throw ConflictException for duplicate reservation code', async () => {
      mockRepository.isCodeUnique.mockResolvedValue(false);

      await expect(service.create(createReservationDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for overlapping reservations', async () => {
      const overlappingReservations = [{ id: 2, reservationCode: 'OTHER-001' }];
      mockRepository.findOverlappingReservations.mockResolvedValue(overlappingReservations);

      await expect(service.create(createReservationDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for underage customer', async () => {
      const underageCustomer = {
        ...mockCustomer,
        dateOfBirth: new Date('2010-01-01'), // 15 años
      };
      mockPrisma.customer.findUnique.mockResolvedValue(underageCustomer);

      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for room capacity exceeded', async () => {
      const smallRoom = {
        ...mockRoom,
        roomType: {
          ...mockRoom.roomType,
          capacity: 1, // Menor que guestCount (2)
        },
      };
      mockPrisma.room.findUnique.mockResolvedValue(smallRoom);

      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for unavailable room', async () => {
      const unavailableRoom = {
        ...mockRoom,
        status: 'MAINTENANCE',
      };
      mockPrisma.room.findUnique.mockResolvedValue(unavailableRoom);

      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid dates', async () => {
      const invalidDto = {
        ...createReservationDto,
        checkInDate: '2024-01-01', // Fecha pasada
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when check-out is before check-in', async () => {
      const invalidDto = {
        ...createReservationDto,
        checkInDate: '2025-09-05',
        checkOutDate: '2025-09-01', // Anterior a check-in
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reservation when found', async () => {
      const mockReservation = {
        id: 1,
        reservationCode: 'RSV-TEST-001',
        status: ReservationStatus.CONFIRMED,
      };
      mockRepository.findById.mockResolvedValue(mockReservation);

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReservation);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkRoomAvailability', () => {
    const roomId = 1;
    const checkInDate = '2025-09-01';
    const checkOutDate = '2025-09-05';

    const mockRoom = {
      id: 1,
      name: 'Habitación 101',
      status: 'AVAILABLE',
      roomType: {
        id: 1,
        name: 'Suite Deluxe',
        capacity: 4,
        basePrice: 150,
      },
    };

    beforeEach(() => {
      mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
    });

    it('should return available when room is free', async () => {
      mockRepository.findOverlappingReservations.mockResolvedValue([]);

      const result = await service.checkRoomAvailability(roomId, checkInDate, checkOutDate);

      expect(result.success).toBe(true);
      expect(result.data.available).toBe(true);
      expect(result.data.conflictingReservations).toHaveLength(0);
    });

    it('should return unavailable when room has conflicts', async () => {
      const conflicts = [{ id: 2, reservationCode: 'OTHER-001' }];
      mockRepository.findOverlappingReservations.mockResolvedValue(conflicts);

      const result = await service.checkRoomAvailability(roomId, checkInDate, checkOutDate);

      expect(result.success).toBe(true);
      expect(result.data.available).toBe(false);
      expect(result.data.conflictingReservations).toEqual(conflicts);
    });

    it('should return unavailable when room status is not AVAILABLE', async () => {
      const unavailableRoom = { ...mockRoom, status: 'MAINTENANCE' };
      mockPrisma.room.findUnique.mockResolvedValue(unavailableRoom);
      mockRepository.findOverlappingReservations.mockResolvedValue([]);

      const result = await service.checkRoomAvailability(roomId, checkInDate, checkOutDate);

      expect(result.success).toBe(true);
      expect(result.data.available).toBe(false);
    });
  });

  describe('findAvailableRooms', () => {
    const checkAvailabilityDto = {
      checkInDate: '2025-09-01',
      checkOutDate: '2025-09-05',
      guestCount: 2,
    };

    it('should return available rooms', async () => {
      const availableRooms = [
        { id: 1, name: 'Habitación 101' },
        { id: 2, name: 'Habitación 102' },
      ];
      mockRepository.findAvailableRooms.mockResolvedValue(availableRooms);

      const result = await service.findAvailableRooms(checkAvailabilityDto);

      expect(result.success).toBe(true);
      expect(result.data.availableRooms).toEqual(availableRooms);
      expect(result.data.totalAvailable).toBe(2);
      expect(result.data.searchCriteria.nights).toBe(4);
    });

    it('should return empty array when no rooms available', async () => {
      mockRepository.findAvailableRooms.mockResolvedValue([]);

      const result = await service.findAvailableRooms(checkAvailabilityDto);

      expect(result.success).toBe(true);
      expect(result.data.availableRooms).toHaveLength(0);
      expect(result.data.totalAvailable).toBe(0);
    });
  });

  describe('calculatePrice', () => {
    const calculatePriceDto = {
      roomId: 1,
      mealPlanId: 2,
      checkInDate: '2025-09-01',
      checkOutDate: '2025-09-05',
      discountType: 'NONE' as any,
    };

    const mockRoom = {
      id: 1,
      roomType: {
        basePrice: 150,
      },
    };

    const mockMealPlan = {
      id: 2,
      dailyPrice: 25,
    };

    beforeEach(() => {
      mockPrisma.room.findUnique.mockResolvedValue(mockRoom);
      mockPrisma.mealPlan.findUnique.mockResolvedValue(mockMealPlan);
    });

    it('should calculate price correctly with meal plan', async () => {
      const result = await service.calculatePrice(calculatePriceDto);

      expect(result.success).toBe(true);
      expect(result.data.roomPrice).toBe(150);
      expect(result.data.mealPlanPrice).toBe(25);
      expect(result.data.nights).toBe(4);
      expect(result.data.subtotal).toBe(700); // (150 + 25) * 4
      expect(result.data.totalAmount).toBe(700); // Sin descuento
    });

    it('should calculate price without meal plan', async () => {
      const dtoWithoutMealPlan = { ...calculatePriceDto, mealPlanId: undefined };

      const result = await service.calculatePrice(dtoWithoutMealPlan);

      expect(result.success).toBe(true);
      expect(result.data.mealPlanPrice).toBe(0);
      expect(result.data.subtotal).toBe(600); // 150 * 4
    });

    it('should apply long stay discount', async () => {
      const longStayDto = {
        ...calculatePriceDto,
        checkOutDate: '2025-09-08', // 7 noches
        discountType: 'LONG_STAY' as any,
      };

      const result = await service.calculatePrice(longStayDto);

      expect(result.data.nights).toBe(7);
      expect(result.data.discountAmount).toBeGreaterThan(0);
      expect(result.data.totalAmount).toBeLessThan(result.data.subtotal);
    });
  });

  describe('update', () => {
    const updateDto = {
      guestCount: 3,
      specialRequests: 'Vista al mar actualizada',
    };

    const existingReservation = {
      id: 1,
      reservationCode: 'RSV-TEST-001',
      roomId: 1,
      checkInDate: new Date('2025-09-01'),
      checkOutDate: new Date('2025-09-05'),
      guestCount: 2,
      status: ReservationStatus.CONFIRMED,
    };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(existingReservation);
      mockRepository.update.mockResolvedValue({ ...existingReservation, ...updateDto });
    });

    it('should update reservation successfully', async () => {
      const result = await service.update(1, updateDto);

      expect(result.success).toBe(true);
      expect(result.data.guestCount).toBe(3);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    const reservation = {
      id: 1,
      status: ReservationStatus.CONFIRMED,
    };

    it('should cancel reservation successfully', async () => {
      mockRepository.findById.mockResolvedValue(reservation);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await service.cancel(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reserva cancelada exitosamente');
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.cancel(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for already cancelled reservation', async () => {
      const cancelledReservation = { ...reservation, status: ReservationStatus.CANCELLED };
      mockRepository.findById.mockResolvedValue(cancelledReservation);

      await expect(service.cancel(1)).rejects.toThrow(BadRequestException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});

describe('DateValidationUtils', () => {
  describe('calculateNights', () => {
    it('should calculate nights correctly', () => {
      const checkIn = new Date('2025-09-01');
      const checkOut = new Date('2025-09-05');
      
      const nights = DateValidationUtils.calculateNights(checkIn, checkOut);
      
      expect(nights).toBe(4);
    });

    it('should return 1 for consecutive days', () => {
      const checkIn = new Date('2025-09-01');
      const checkOut = new Date('2025-09-02');
      
      const nights = DateValidationUtils.calculateNights(checkIn, checkOut);
      
      expect(nights).toBe(1);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly for adult', () => {
      const birthDate = new Date('1990-05-15');
      const age = DateValidationUtils.calculateAge(birthDate);
      
      expect(age).toBeGreaterThanOrEqual(30);
    });

    it('should calculate age correctly for minor', () => {
      const birthDate = new Date('2010-05-15');
      const age = DateValidationUtils.calculateAge(birthDate);
      
      expect(age).toBeLessThan(18);
    });

    it('should handle birthday not yet reached this year', () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const birthDate = new Date(nextMonth.getFullYear() - 25, nextMonth.getMonth(), nextMonth.getDate());
      
      const age = DateValidationUtils.calculateAge(birthDate);
      
      expect(age).toBe(24); // Aún no cumple 25
    });
  });

  describe('isWithinBookingWindow', () => {
    it('should return true for dates within one year', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6); // 6 meses adelante
      
      const result = DateValidationUtils.isWithinBookingWindow(futureDate);
      
      expect(result).toBe(true);
    });

    it('should return false for dates beyond one year', () => {
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 2); // 2 años adelante
      
      const result = DateValidationUtils.isWithinBookingWindow(farFutureDate);
      
      expect(result).toBe(false);
    });
  });
});
