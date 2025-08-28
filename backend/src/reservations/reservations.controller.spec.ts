import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto, CheckAvailabilityDto } from './dto/reservation.dto';
import { ReservationStatus } from './interfaces/reservation.enums';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    findByCustomer: jest.fn(),
    checkAvailability: jest.fn(),
    findAvailableRooms: jest.fn(),
    calculatePrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
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

    const mockResponse = {
      success: true,
      data: {
        id: 1,
        ...createReservationDto,
        checkInDate: new Date('2025-09-01'),
        checkOutDate: new Date('2025-09-05'),
        status: ReservationStatus.PENDING,
        totalAmount: 600,
      },
      message: 'Reserva creada exitosamente',
    };

    it('should create a reservation', async () => {
      mockReservationsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createReservationDto);

      expect(service.create).toHaveBeenCalledWith(createReservationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    const mockReservations = [
      {
        id: 1,
        reservationCode: 'RSV-001',
        status: ReservationStatus.CONFIRMED,
      },
      {
        id: 2,
        reservationCode: 'RSV-002',
        status: ReservationStatus.PENDING,
      },
    ];

    it('should return all reservations', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservations: mockReservations,
          total: 2,
          pagination: {
            page: 1,
            pageSize: 10,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      mockReservationsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const mockReservation = {
      id: 1,
      reservationCode: 'RSV-TEST-001',
      status: ReservationStatus.CONFIRMED,
      customer: {
        id: 1,
        firstName: 'Juan',
        lastName: 'García',
      },
      room: {
        id: 1,
        name: 'Habitación 101',
      },
    };

    it('should return a reservation by id', async () => {
      const mockResponse = {
        success: true,
        data: mockReservation,
      };

      mockReservationsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findByCode', () => {
    const mockReservation = {
      id: 1,
      reservationCode: 'RSV-TEST-001',
      status: ReservationStatus.CONFIRMED,
    };

    it('should return a reservation by code', async () => {
      const mockResponse = {
        success: true,
        data: mockReservation,
      };

      mockReservationsService.findByCode.mockResolvedValue(mockResponse);

      const result = await controller.findByCode('RSV-TEST-001');

      expect(service.findByCode).toHaveBeenCalledWith('RSV-TEST-001');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    const updateReservationDto: UpdateReservationDto = {
      guestCount: 3,
      specialRequests: 'Vista al mar',
    };

    const mockUpdatedReservation = {
      id: 1,
      reservationCode: 'RSV-TEST-001',
      guestCount: 3,
      specialRequests: 'Vista al mar',
      status: ReservationStatus.CONFIRMED,
    };

    it('should update a reservation', async () => {
      const mockResponse = {
        success: true,
        data: mockUpdatedReservation,
        message: 'Reserva actualizada exitosamente',
      };

      mockReservationsService.update.mockResolvedValue(mockResponse);

      const result = await controller.update(1, updateReservationDto);

      expect(service.update).toHaveBeenCalledWith(1, updateReservationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      const mockResponse = {
        success: true,
        message: 'Reserva cancelada exitosamente',
      };

      mockReservationsService.cancel.mockResolvedValue(mockResponse);

      const result = await controller.cancel(1);

      expect(service.cancel).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findByCustomer', () => {
    const mockCustomerReservations = [
      {
        id: 1,
        reservationCode: 'RSV-001',
        status: ReservationStatus.CONFIRMED,
      },
      {
        id: 2,
        reservationCode: 'RSV-002',
        status: ReservationStatus.PENDING,
      },
    ];

    it('should return reservations for a customer', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservations: mockCustomerReservations,
          total: 2,
          customerId: 1,
        },
      };

      mockReservationsService.findByCustomer.mockResolvedValue(mockResponse);

      const result = await controller.findByCustomer(1);

      expect(service.findByCustomer).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAvailableRooms', () => {
    const checkAvailabilityDto: CheckAvailabilityDto = {
      checkInDate: '2025-09-01',
      checkOutDate: '2025-09-05',
      guestCount: 2,
    };

    it('should find available rooms', async () => {
      const mockResponse = {
        success: true,
        data: {
          availableRooms: [
            {
              id: 1,
              name: 'Habitación 101',
              roomType: {
                id: 1,
                name: 'Suite Deluxe',
                capacity: 4,
                basePrice: 150,
              },
            },
          ],
          totalAvailable: 1,
          searchCriteria: {
            checkInDate: new Date('2025-09-01'),
            checkOutDate: new Date('2025-09-05'),
            guestCount: 2,
            nights: 4,
          },
        },
      };

      mockReservationsService.findAvailableRooms.mockResolvedValue(mockResponse);

      const result = await controller.findAvailableRooms(checkAvailabilityDto);

      expect(service.findAvailableRooms).toHaveBeenCalledWith(checkAvailabilityDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('calculatePrice', () => {
    const request = {
      query: {
        roomId: '1',
        checkInDate: '2025-09-01',
        checkOutDate: '2025-09-05',
        mealPlanId: '2',
        discountType: 'NONE',
      },
    } as any;

    it('should calculate reservation price', async () => {
      const mockResponse = {
        success: true,
        data: {
          roomPrice: 150,
          mealPlanPrice: 25,
          nights: 4,
          subtotal: 700,
          discountType: 'NONE',
          discountAmount: 0,
          totalAmount: 700,
          calculationDate: new Date(),
        },
      };

      mockReservationsService.calculatePrice.mockResolvedValue(mockResponse);

      const result = await controller.calculatePrice(request);

      expect(service.calculatePrice).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
