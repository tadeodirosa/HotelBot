import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { PrismaService } from '../config/prisma.service';
import { $Enums } from '@prisma/client';

describe('MealPlansService', () => {
  let service: MealPlansService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    mealPlan: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MealPlansService>(MealPlansService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMealPlanDto = {
      name: 'Test Plan',
      description: 'Test Description',
      type: $Enums.MealPlanType.BREAKFAST,
      dailyPrice: 25.99,
      features: ['Feature 1', 'Feature 2'],
    };

    const mockCreatedPlan = {
      id: 1,
      ...createMealPlanDto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a meal plan successfully', async () => {
      mockPrismaService.mealPlan.findFirst.mockResolvedValue(null);
      mockPrismaService.mealPlan.create.mockResolvedValue(mockCreatedPlan);

      const result = await service.create(createMealPlanDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Test Plan');
      expect(result.data.name).toBe('Test Plan');
      expect(mockPrismaService.mealPlan.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Plan' },
      });
      expect(mockPrismaService.mealPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Plan',
          description: 'Test Description',
          type: $Enums.MealPlanType.BREAKFAST,
          dailyPrice: 25.99,
          features: ['Feature 1', 'Feature 2'],
        }),
      });
    });

    it('should throw ConflictException if meal plan name already exists', async () => {
      mockPrismaService.mealPlan.findFirst.mockResolvedValue({ id: 1, name: 'Test Plan' });

      await expect(service.create(createMealPlanDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.mealPlan.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockMealPlans = [
      {
        id: 1,
        name: 'Plan 1',
        description: 'Description 1',
        type: $Enums.MealPlanType.BREAKFAST,
        dailyPrice: 25.99,
        features: ['Feature 1'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Plan 2',
        description: 'Description 2',
        type: $Enums.MealPlanType.HALF_BOARD,
        dailyPrice: 65.99,
        features: ['Feature 2'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return paginated meal plans', async () => {
      mockPrismaService.mealPlan.findMany.mockResolvedValue(mockMealPlans);
      mockPrismaService.mealPlan.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result.success).toBe(true);
      expect(result.data.mealPlans).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(mockPrismaService.mealPlan.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.mealPlan.findMany.mockResolvedValue([]);
      mockPrismaService.mealPlan.count.mockResolvedValue(25);

      const result = await service.findAll(3, 5);

      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(5);
      expect(result.data.totalPages).toBe(5);
      expect(mockPrismaService.mealPlan.findMany).toHaveBeenCalledWith({
        skip: 10, // (3-1) * 5
        take: 5,
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    const mockMealPlan = {
      id: 1,
      name: 'Test Plan',
      description: 'Test Description',
      type: $Enums.MealPlanType.BREAKFAST,
      dailyPrice: 25.99,
      features: ['Feature 1'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return meal plan by id', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(mockMealPlan);

      const result = await service.findById(1);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test Plan');
      expect(mockPrismaService.mealPlan.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if meal plan not found', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockExistingPlan = {
      id: 1,
      name: 'Original Plan',
      description: 'Original Description',
      type: $Enums.MealPlanType.BREAKFAST,
      dailyPrice: 25.99,
      features: ['Feature 1'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      name: 'Updated Plan',
      description: 'Updated Description',
    };

    it('should update meal plan successfully', async () => {
      const updatedPlan = { ...mockExistingPlan, ...updateDto };
      
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(mockExistingPlan);
      mockPrismaService.mealPlan.findFirst.mockResolvedValue(null);
      mockPrismaService.mealPlan.update.mockResolvedValue(updatedPlan);

      const result = await service.update(1, updateDto);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Plan');
      expect(mockPrismaService.mealPlan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if meal plan not found', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if name already exists', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(mockExistingPlan);
      mockPrismaService.mealPlan.findFirst.mockResolvedValue({ id: 2, name: 'Updated Plan' });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('activate', () => {
    const mockPlan = {
      id: 1,
      name: 'Test Plan',
      isActive: false,
      updatedAt: new Date(),
    };

    it('should activate meal plan successfully', async () => {
      const activatedPlan = { ...mockPlan, isActive: true };
      
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.mealPlan.update.mockResolvedValue(activatedPlan);

      const result = await service.activate(1);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(true);
      expect(mockPrismaService.mealPlan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: true },
      });
    });

    it('should throw NotFoundException if meal plan not found', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(null);

      await expect(service.activate(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    const mockPlan = {
      id: 1,
      name: 'Test Plan',
      isActive: true,
      updatedAt: new Date(),
    };

    it('should deactivate meal plan successfully', async () => {
      const deactivatedPlan = { ...mockPlan, isActive: false };
      
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.mealPlan.update.mockResolvedValue(deactivatedPlan);

      const result = await service.deactivate(1);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
      expect(mockPrismaService.mealPlan.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if meal plan not found', async () => {
      mockPrismaService.mealPlan.findUnique.mockResolvedValue(null);

      await expect(service.deactivate(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return meal plan statistics', async () => {
      mockPrismaService.mealPlan.count
        .mockResolvedValueOnce(4) // active count
        .mockResolvedValueOnce(1); // inactive count
      
      mockPrismaService.mealPlan.aggregate.mockResolvedValue({
        _avg: { dailyPrice: 65.5 },
        _min: { dailyPrice: 0 },
        _max: { dailyPrice: 145.99 },
      });

      const result = await service.getStatistics();

      expect(result.success).toBe(true);
      expect(result.data.totalMealPlans).toBe(5);
      expect(result.data.totalActive).toBe(4);
      expect(result.data.totalInactive).toBe(1);
      expect(result.data.averagePrice).toBe(65.5);
      expect(result.data.priceRange.min).toBe(0);
      expect(result.data.priceRange.max).toBe(145.99);
    });
  });
});
