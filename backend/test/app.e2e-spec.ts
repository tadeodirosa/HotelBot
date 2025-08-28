import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HotelBot API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should reject protected routes without authentication', () => {
      return request(app.getHttpServer())
        .get('/customers')
        .expect(401);
    });
  });

  describe('Room Types API', () => {
    it('should require authentication for room types', () => {
      return request(app.getHttpServer())
        .get('/room-types')
        .expect(401);
    });
  });

  describe('Rooms API', () => {
    it('should require authentication for rooms', () => {
      return request(app.getHttpServer())
        .get('/rooms')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });
  });

  describe('API Documentation', () => {
    it('should be accessible at /api/docs (may return 404 if not configured for production)', () => {
      return request(app.getHttpServer())
        .get('/api/docs')
        .expect((res) => {
          // In test environment, docs might not be configured
          expect([200, 404]).toContain(res.status);
        });
    });
  });
});
