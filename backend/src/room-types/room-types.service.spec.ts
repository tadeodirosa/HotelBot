import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypesService } from './room-types.service';
import { RoomTypeRepository } from './room-types.repository';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { BusinessRuleException, EntityNotFoundException } from '../shared/exceptions/business.exception';

describe('RoomTypesService', () => {
  let service: RoomTypesService;
  let repository: RoomTypeRepository;

  const mockRoomType = {
    id: 1,
    name: 'Deluxe Suite',
    description: 'Luxurious suite with ocean view',
    capacity: 2,
    basePrice: 299.99,
    amenities: ['wifi', 'minibar', 'balcony'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    hasRoomsAssigned: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypesService,
        {
          provide: RoomTypeRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RoomTypesService>(RoomTypesService);
    repository = module.get<RoomTypeRepository>(RoomTypeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a room type successfully', async () => {
      const createDto: CreateRoomTypeDto = {
        name: 'Deluxe Suite',
        description: 'Luxurious suite with ocean view',
        capacity: 2,
        basePrice: 299.99,
        amenities: ['wifi', 'minibar', 'balcony'],
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockRoomType);

      const result = await service.create(createDto);

      expect(mockRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: mockRoomType.id,
        name: mockRoomType.name,
        capacity: mockRoomType.capacity,
        basePrice: mockRoomType.basePrice,
        description: mockRoomType.description,
        amenities: mockRoomType.amenities,
        createdAt: mockRoomType.createdAt,
        updatedAt: mockRoomType.updatedAt,
      });
    });

    it('should throw BusinessRuleException if name already exists', async () => {
      const createDto: CreateRoomTypeDto = {
        name: 'Deluxe Suite',
        description: 'Luxurious suite with ocean view',
        capacity: 2,
        basePrice: 299.99,
        amenities: ['wifi', 'minibar', 'balcony'],
      };

      mockRepository.findByName.mockResolvedValue(mockRoomType);

      await expect(service.create(createDto)).rejects.toThrow(BusinessRuleException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return room type if found', async () => {
      mockRepository.findById.mockResolvedValue(mockRoomType);

      const result = await service.findOne(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(mockRoomType.id);
    });

    it('should throw EntityNotFoundException if room type not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(EntityNotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findAll', () => {
    it('should return all room types', async () => {
      const roomTypes = [mockRoomType];
      mockRepository.findAll.mockResolvedValue(roomTypes);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update room type successfully', async () => {
      const updateDto: UpdateRoomTypeDto = {
        description: 'Updated description',
        basePrice: 349.99,
      };

      const updatedRoomType = { ...mockRoomType, ...updateDto };
      mockRepository.findById.mockResolvedValue(mockRoomType);
      mockRepository.update.mockResolvedValue(updatedRoomType);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.success).toBe(true);
      expect(result.data.basePrice).toBe(349.99);
    });

    it('should throw EntityNotFoundException if room type not found', async () => {
      const updateDto: UpdateRoomTypeDto = {
        description: 'Updated description',
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(EntityNotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleException if name already exists for another room type', async () => {
      const updateDto: UpdateRoomTypeDto = {
        name: 'Existing Name',
      };

      const anotherRoomType = { ...mockRoomType, id: 2, name: 'Existing Name' };
      mockRepository.findById.mockResolvedValue(mockRoomType);
      mockRepository.findByName.mockResolvedValue(anotherRoomType);

      await expect(service.update(1, updateDto)).rejects.toThrow(BusinessRuleException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete room type successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockRoomType);
      mockRepository.hasRoomsAssigned.mockResolvedValue(false);
      mockRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.hasRoomsAssigned).toHaveBeenCalledWith(1);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should throw EntityNotFoundException if room type not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(EntityNotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleException if room type has rooms assigned', async () => {
      mockRepository.findById.mockResolvedValue(mockRoomType);
      mockRepository.hasRoomsAssigned.mockResolvedValue(true);

      await expect(service.remove(1)).rejects.toThrow(BusinessRuleException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
