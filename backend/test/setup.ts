import { PrismaService } from '../src/config/prisma.service';

// Setup global test configuration
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:Masmillones2025@localhost:5432/hotelbot_test';
});

afterAll(async () => {
  // Cleanup after all tests
  const prisma = new PrismaService();
  await prisma.$disconnect();
});

// Global test utilities
global.console = {
  ...console,
  // Suppress logs during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
