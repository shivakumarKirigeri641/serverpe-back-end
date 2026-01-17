/**
 * ==============================================
 * E2E TESTS - TRAIN ENDPOINTS
 * ==============================================
 * Note: These tests mock the external serverpe API calls.
 * For full integration testing, serverpe-back-end should be running.
 */

const request = require('supertest');
const app = require('../../src/app');

const API_KEY = 'QS_DEMO_API_KEY_2026_STUDENT_TRAIN';
const INVALID_API_KEY = 'INVALID_KEY_12345';

// Mock axios to avoid actual API calls
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return mockAxios;
});

const axios = require('axios');

describe('Train Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ============================================================
     GET /student/train/stations
     ============================================================ */
  describe('GET /student/train/stations', () => {
    const mockStations = [
      { code: 'NDLS', station_name: 'New Delhi', zone: 'NR' },
      { code: 'MAS', station_name: 'Chennai Central', zone: 'SR' },
    ];

    // POSITIVE TESTS
    test('should return stations list with valid API key', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { stations: mockStations }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/stations')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.stations).toEqual(mockStations);
      expect(res.body.message).toBe('Stations fetched successfully');
    });

    // NEGATIVE TESTS
    test('should reject without API key', async () => {
      const res = await request(app)
        .get('/student/train/stations')
        .expect(401);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Invalid or missing API key');
    });

    test('should reject with invalid API key', async () => {
      const res = await request(app)
        .get('/student/train/stations')
        .set('X-API-Key', INVALID_API_KEY)
        .expect(401);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     GET /student/train/reservation-types
     ============================================================ */
  describe('GET /student/train/reservation-types', () => {
    const mockTypes = [
      { id: 1, type_code: 'GEN', description: 'General' },
      { id: 2, type_code: 'TATKAL', description: 'Tatkal' },
    ];

    test('should return reservation types', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { reservation_types: mockTypes }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/reservation-types')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.reservation_types).toEqual(mockTypes);
    });

    test('should reject without API key', async () => {
      await request(app)
        .get('/student/train/reservation-types')
        .expect(401);
    });
  });

  /* ============================================================
     GET /student/train/coach-types
     ============================================================ */
  describe('GET /student/train/coach-types', () => {
    const mockCoachTypes = [
      { id: 1, coach_code: 'SL', description: 'Sleeper' },
      { id: 2, coach_code: '3A', description: 'Third AC' },
    ];

    test('should return coach types', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { coach_types: mockCoachTypes }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/coach-types')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.coach_types).toEqual(mockCoachTypes);
    });
  });

  /* ============================================================
     GET /student/train/search
     ============================================================ */
  describe('GET /student/train/search', () => {
    const mockTrains = [
      {
        train_number: '12951',
        train_name: 'Rajdhani Express',
        departure: '16:55',
        arrival: '08:35',
      },
    ];

    // POSITIVE TESTS
    test('should search trains with valid parameters', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          data: { trains: mockTrains, trains_count: 1 },
          successstatus: true,
        },
      });

      const res = await request(app)
        .get('/student/train/search')
        .query({ source: 'NDLS', destination: 'MAS', doj: '2026-02-15' })
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.trains).toBeDefined();
      expect(res.body.data.query.source).toBe('NDLS');
    });

    // NEGATIVE TESTS
    test('should reject without source parameter', async () => {
      const res = await request(app)
        .get('/student/train/search')
        .query({ destination: 'MAS', doj: '2026-02-15' })
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toContain('Missing required parameters');
    });

    test('should reject without destination parameter', async () => {
      const res = await request(app)
        .get('/student/train/search')
        .query({ source: 'NDLS', doj: '2026-02-15' })
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without doj parameter', async () => {
      const res = await request(app)
        .get('/student/train/search')
        .query({ source: 'NDLS', destination: 'MAS' })
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject with invalid date format', async () => {
      const res = await request(app)
        .get('/student/train/search')
        .query({ source: 'NDLS', destination: 'MAS', doj: '15-02-2026' })
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toContain('Invalid date format');
    });

    test('should reject without API key', async () => {
      await request(app)
        .get('/student/train/search')
        .query({ source: 'NDLS', destination: 'MAS', doj: '2026-02-15' })
        .expect(401);
    });
  });

  /* ============================================================
     GET /student/train/schedule/:train_input
     ============================================================ */
  describe('GET /student/train/schedule/:train_input', () => {
    const mockSchedule = {
      train_number: '12951',
      train_name: 'Rajdhani Express',
      schedule: [
        { station_code: 'NDLS', arrival: '00:00', departure: '16:55' },
        { station_code: 'MAS', arrival: '08:35', departure: '00:00' },
      ],
    };

    // POSITIVE TESTS
    test('should return train schedule', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { schedule: mockSchedule }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/schedule/12951')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.schedule).toBeDefined();
    });

    // NEGATIVE TESTS
    test('should return 404 for non-existent train', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { schedule: null }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/schedule/99999')
        .set('X-API-Key', API_KEY)
        .expect(404);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     GET /student/train/pnr-status/:pnr
     ============================================================ */
  describe('GET /student/train/pnr-status/:pnr', () => {
    const mockPnrStatus = {
      pnr: 'ABC123',
      pnr_status: 'CONFIRMED',
      train_number: '12951',
      passengers: [{ name: 'John', status: 'CNF' }],
    };

    // POSITIVE TESTS
    test('should return PNR status', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { pnr_status: mockPnrStatus }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/pnr-status/ABC123')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.pnr_status).toBeDefined();
    });

    // NEGATIVE TESTS
    test('should return 404 for non-existent PNR', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { pnr_status: null }, successstatus: true },
      });

      const res = await request(app)
        .get('/student/train/pnr-status/INVALID123')
        .set('X-API-Key', API_KEY)
        .expect(404);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('PNR not found');
    });
  });

  /* ============================================================
     POST /student/train/calculate-fare
     ============================================================ */
  describe('POST /student/train/calculate-fare', () => {
    const mockFare = {
      train_number: '12951',
      fare: {
        baseFare: 1000,
        gst: 180,
        grandTotal: 1180,
      },
    };

    const validFareRequest = {
      train_number: '12951',
      source_code: 'NDLS',
      destination_code: 'MAS',
      doj: '2026-02-15',
      coach_code: 'SL',
      reservation_type: 'GEN',
      passengers: [
        { passenger_name: 'John Doe', passenger_age: 30, passenger_gender: 'M' },
      ],
    };

    // POSITIVE TESTS
    test('should calculate fare for valid request', async () => {
      axios.post.mockResolvedValueOnce({
        data: { data: { fare: mockFare }, successstatus: true },
      });

      const res = await request(app)
        .post('/student/train/calculate-fare')
        .set('X-API-Key', API_KEY)
        .send(validFareRequest)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.fare).toBeDefined();
    });

    // NEGATIVE TESTS
    test('should reject without train_number', async () => {
      const invalidRequest = { ...validFareRequest };
      delete invalidRequest.train_number;

      const res = await request(app)
        .post('/student/train/calculate-fare')
        .set('X-API-Key', API_KEY)
        .send(invalidRequest)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without passengers', async () => {
      const invalidRequest = { ...validFareRequest, passengers: [] };

      const res = await request(app)
        .post('/student/train/calculate-fare')
        .set('X-API-Key', API_KEY)
        .send(invalidRequest)
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject with more than 6 passengers', async () => {
      const tooManyPassengers = Array(7).fill({
        passenger_name: 'Test',
        passenger_age: 25,
        passenger_gender: 'M',
      });

      const res = await request(app)
        .post('/student/train/calculate-fare')
        .set('X-API-Key', API_KEY)
        .send({ ...validFareRequest, passengers: tooManyPassengers })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject passenger with invalid age', async () => {
      const invalidPassengers = [
        { passenger_name: 'Test', passenger_age: -5, passenger_gender: 'M' },
      ];

      const res = await request(app)
        .post('/student/train/calculate-fare')
        .set('X-API-Key', API_KEY)
        .send({ ...validFareRequest, passengers: invalidPassengers })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     404 NOT FOUND
     ============================================================ */
  describe('404 Not Found', () => {
    test('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/student/train/nonexistent')
        .set('X-API-Key', API_KEY)
        .expect(404);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });
});
