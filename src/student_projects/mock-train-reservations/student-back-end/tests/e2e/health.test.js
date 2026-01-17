/**
 * ==============================================
 * E2E TESTS - HEALTH ENDPOINTS
 * ==============================================
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Health Endpoints', () => {
  /* ============================================================
     GET /health
     ============================================================ */
  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('quicksmart-train-reservation-student');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  /* ============================================================
     GET /health/detailed
     ============================================================ */
  describe('GET /health/detailed', () => {
    test('should return detailed health status', async () => {
      const res = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(res.body.uptime).toBeDefined();
      expect(res.body.memory).toBeDefined();
      expect(res.body.dependencies).toBeDefined();
    });
  });

  /* ============================================================
     GET / (Root)
     ============================================================ */
  describe('GET /', () => {
    test('should return API info', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body.name).toBe('Quicksmart Mock Train Reservation API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.endpoints).toBeDefined();
    });
  });
});
