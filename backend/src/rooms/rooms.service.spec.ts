import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { RoomRepository } from './rooms.repository';
import { RoomTypeRepository } from '../room-types/room-types.repository';
import { CreateRoomDto, UpdateRoomDto, RoomStatus } from './dto/room.dto';
import { BusinessRuleException, EntityNotFoundException } from '../shared/exceptions/business.exception';

describe('RoomsService', () => {
  let service: RoomsService;
  let roomRepository: RoomRepository;
  let roomTypeRepository: RoomTypeRepository;

  const mockRoom = {
    id: 1,
    name: '101',
    floor: 1,
    status: RoomStatus.AVAILABLE,
    roomTypeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    roomType: {
      id: 1,
      name: 'Deluxe Suite',
      capacity: 2,
      basePrice: 299.99,
    },
  };

  const mockRoomRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findByStatus: jest.fn(),
    findByFloor: jest.fn(),
    findByRoomType: jest.fn(),
    getRoomStats: jest.fn(),
    hasActiveReservations: jest.fn(),
  };

  const mockRoomTypeRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: RoomRepository,
          useValue: mockRoomRepository,
        },
        {
          provide: RoomTypeRepository,
          useValue: mockRoomTypeRepository,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    roomRepository = module.get<RoomRepository>(RoomRepository);
    roomTypeRepository = module.get<RoomTypeRepository>(RoomTypeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a room successfully', async () => {
      const createDto: CreateRoomDto = {
        name: '101',
        floor: 1,
        roomTypeId: 1,
        status: RoomStatus.AVAILABLE,
      };

      const mockRoomType = {
        id: 1,
        name: 'Deluxe Suite',
        capacity: 2,
        basePrice: 299.99,
      };

      mockRoomRepository.findByName.mockResolvedValue(null);
      mockRoomTypeRepository.findById.mockResolvedValue(mockRoomType);
      mockRoomRepository.create.mockResolvedValue(mockRoom);

      const result = await service.create(createDto);

      expect(mockRoomRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(mockRoomTypeRepository.findById).toHaveBeenCalledWith(createDto.roomTypeId);
      expect(mockRoomRepository.create).toHaveBeenCalledWith(createDto);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('101');
    });

    it('should throw BusinessRuleException if room name already exists', async () => {
      const createDto: CreateRoomDto = {
        name: '101',
        floor: 1,
        roomTypeId: 1,
        status: RoomStatus.AVAILABLE,
      };

      mockRoomRepository.findByName.mockResolvedValue(mockRoom);

      await expect(service.create(createDto)).rejects.toThrow(BusinessRuleException);
      expect(mockRoomRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleException if room type not found', async () => {
      const createDto: CreateRoomDto = {
        name: '101',
        floor: 1,
        roomTypeId: 999,
        status: RoomStatus.AVAILABLE,
      };

      mockRoomRepository.findByName.mockResolvedValue(null);
      mockRoomTypeRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BusinessRuleException);
      expect(mockRoomRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return room if found', async () => {
      mockRoomRepository.findById.mockResolvedValue(mockRoom);

      const result = await service.findOne(1);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(mockRoom.id);
    });

    it('should throw EntityNotFoundException if room not found', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(EntityNotFoundException);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const rooms = [mockRoom];
      mockRoomRepository.findAll.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(mockRoomRepository.findAll).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update room successfully', async () => {
      const updateDto: UpdateRoomDto = {
        floor: 2,
      };

      const updatedRoom = { ...mockRoom, ...updateDto };
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockRoomRepository.update.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateDto);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRoomRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.success).toBe(true);
      expect(result.data.floor).toBe(2);
    });

    it('should throw EntityNotFoundException if room not found', async () => {
      const updateDto: UpdateRoomDto = {
        floor: 2,
      };

      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(EntityNotFoundException);
      expect(mockRoomRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleException if room name already exists for another room', async () => {
      const updateDto: UpdateRoomDto = {
        name: '102',
      };

      const anotherRoom = { ...mockRoom, id: 2, name: '102' };
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockRoomRepository.findByName.mockResolvedValue(anotherRoom);

      await expect(service.update(1, updateDto)).rejects.toThrow(BusinessRuleException);
      expect(mockRoomRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete room successfully when room is available', async () => {
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockRoomRepository.hasActiveReservations.mockResolvedValue(false);
      mockRoomRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRoomRepository.hasActiveReservations).toHaveBeenCalledWith(1);
      expect(mockRoomRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should throw EntityNotFoundException if room not found', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(EntityNotFoundException);
      expect(mockRoomRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleException if room has active reservations', async () => {
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockRoomRepository.hasActiveReservations.mockResolvedValue(true);

      await expect(service.remove(1)).rejects.toThrow(BusinessRuleException);
      expect(mockRoomRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
