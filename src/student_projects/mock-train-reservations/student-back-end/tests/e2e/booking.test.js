/**
 * ==============================================
 * E2E TESTS - PROTECTED ENDPOINTS (Booking)
 * ==============================================
 * Tests for endpoints that require both API key and authentication.
 */

const request = require('supertest');
const app = require('../../src/app');

const API_KEY = 'QS_DEMO_API_KEY_2026_STUDENT_TRAIN';

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

describe('Protected Endpoints (Booking)', () => {
  let authCookie;
  const testEmail = 'booking-test@example.com';

  beforeAll(async () => {
    // Authenticate first
    await request(app)
      .post('/student/auth/send-otp')
      .set('X-API-Key', API_KEY)
      .send({ email: testEmail });

    const res = await request(app)
      .post('/student/auth/verify-otp')
      .set('X-API-Key', API_KEY)
      .send({ email: testEmail, otp: '1234' });

    authCookie = res.headers['set-cookie'];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ============================================================
     POST /student/train/book-ticket
     ============================================================ */
  describe('POST /student/train/book-ticket', () => {
    const validBookingRequest = {
      train_number: '12951',
      source_code: 'NDLS',
      destination_code: 'MAS',
      doj: '2026-02-15',
      coach_code: 'SL',
      reservation_type: 'GEN',
      passengers: [
        { passenger_name: 'John Doe', passenger_age: 30, passenger_gender: 'M' },
      ],
      mobile_number: '9876543210',
      email: 'booking-test@example.com',
      total_fare: 1180,
    };

    const mockBookingResponse = {
      pnr: 'ABC123',
      pnr_status: 'CONFIRMED',
      train_details: {
        train_number: '12951',
        train_name: 'Rajdhani Express',
      },
    };

    // POSITIVE TESTS
    test('should book ticket for authenticated user', async () => {
      axios.post.mockResolvedValueOnce({
        data: { data: { booking: mockBookingResponse }, successstatus: true },
      });

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send(validBookingRequest)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('Ticket booked successfully');
      expect(res.body.data.booking).toBeDefined();
    });

    // NEGATIVE TESTS - Authentication
    test('should reject without API key', async () => {
      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('Cookie', authCookie)
        .send(validBookingRequest)
        .expect(401);

      expect(res.body.message).toBe('Invalid or missing API key');
    });

    test('should reject without authentication', async () => {
      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .send(validBookingRequest)
        .expect(401);

      expect(res.body.message).toBe('Token not found!');
    });

    // NEGATIVE TESTS - Validation
    test('should reject without journey details', async () => {
      const invalidRequest = { ...validBookingRequest };
      delete invalidRequest.train_number;

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send(invalidRequest)
        .expect(400);

      expect(res.body.message).toBe('Missing required journey details');
    });

    test('should reject without mobile number', async () => {
      const invalidRequest = { ...validBookingRequest };
      delete invalidRequest.mobile_number;

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send(invalidRequest)
        .expect(400);

      expect(res.body.message).toBe('Mobile number is required');
    });

    test('should reject without email', async () => {
      const invalidRequest = { ...validBookingRequest };
      delete invalidRequest.email;

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send(invalidRequest)
        .expect(400);

      expect(res.body.message).toBe('Valid email is required');
    });

    test('should reject with invalid email', async () => {
      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ ...validBookingRequest, email: 'invalid' })
        .expect(400);

      expect(res.body.message).toBe('Valid email is required');
    });

    test('should reject without passengers', async () => {
      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ ...validBookingRequest, passengers: [] })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject with more than 6 passengers', async () => {
      const tooManyPassengers = Array(7).fill({
        passenger_name: 'Test User',
        passenger_age: 25,
        passenger_gender: 'M',
      });

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ ...validBookingRequest, passengers: tooManyPassengers })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject with invalid passenger data', async () => {
      const invalidPassengers = [
        { passenger_name: 'A', passenger_age: 30, passenger_gender: 'M' }, // Name too short
      ];

      const res = await request(app)
        .post('/student/train/book-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ ...validBookingRequest, passengers: invalidPassengers })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     POST /student/train/cancel-ticket
     ============================================================ */
  describe('POST /student/train/cancel-ticket', () => {
    const mockCancellationResponse = {
      pnr: 'ABC123',
      cancelled_passengers: [1],
      refund_amount: 500,
    };

    // POSITIVE TESTS
    test('should cancel ticket for authenticated user', async () => {
      axios.post.mockResolvedValueOnce({
        data: { data: { cancellation: mockCancellationResponse }, successstatus: true },
      });

      const res = await request(app)
        .post('/student/train/cancel-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ pnr: 'ABC123', passenger_ids: [1] })
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('Ticket cancelled successfully');
    });

    // NEGATIVE TESTS
    test('should reject without PNR', async () => {
      const res = await request(app)
        .post('/student/train/cancel-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ passenger_ids: [1] })
        .expect(400);

      expect(res.body.message).toBe('PNR is required');
    });

    test('should reject without passenger_ids', async () => {
      const res = await request(app)
        .post('/student/train/cancel-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ pnr: 'ABC123' })
        .expect(400);

      expect(res.body.message).toBe('At least one passenger ID is required for cancellation');
    });

    test('should reject with empty passenger_ids array', async () => {
      const res = await request(app)
        .post('/student/train/cancel-ticket')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .send({ pnr: 'ABC123', passenger_ids: [] })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without authentication', async () => {
      await request(app)
        .post('/student/train/cancel-ticket')
        .set('X-API-Key', API_KEY)
        .send({ pnr: 'ABC123', passenger_ids: [1] })
        .expect(401);
    });
  });

  /* ============================================================
     GET /student/train/booking-history/:email
     ============================================================ */
  describe('GET /student/train/booking-history/:email', () => {
    const mockBookingHistory = [
      {
        pnr: 'ABC123',
        train_number: '12951',
        date_of_journey: '2026-02-15',
      },
    ];

    // POSITIVE TESTS
    test('should return booking history for own email', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: { bookings: mockBookingHistory }, successstatus: true },
      });

      const res = await request(app)
        .get(`/student/train/booking-history/${testEmail}`)
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('Booking history fetched successfully');
    });

    // NEGATIVE TESTS
    test('should reject for different user email (security)', async () => {
      const res = await request(app)
        .get('/student/train/booking-history/other@example.com')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .expect(403);

      expect(res.body.message).toBe('You can only view your own booking history');
    });

    test('should reject with invalid email format', async () => {
      const res = await request(app)
        .get('/student/train/booking-history/invalid-email')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .expect(400);

      expect(res.body.message).toBe('Valid email is required');
    });

    test('should reject without authentication', async () => {
      await request(app)
        .get(`/student/train/booking-history/${testEmail}`)
        .set('X-API-Key', API_KEY)
        .expect(401);
    });
  });
});
