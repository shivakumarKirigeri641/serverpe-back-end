/**
 * ==============================================
 * E2E TESTS - AUTHENTICATION ENDPOINTS
 * ==============================================
 */

const request = require('supertest');
const app = require('../../src/app');

const API_KEY = 'QS_DEMO_API_KEY_2026_STUDENT_TRAIN';
const INVALID_API_KEY = 'INVALID_KEY_12345';

describe('Auth Endpoints', () => {
  /* ============================================================
     POST /student/auth/send-otp
     ============================================================ */
  describe('POST /student/auth/send-otp', () => {
    // POSITIVE TESTS
    test('should send OTP for valid email with API key', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('OTP sent successfully');
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.expires_in).toBe('10 minutes');
      // In development, OTP is included
      expect(res.body.data.otp).toBe('1234');
    });

    test('should send OTP with API key in query param', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp?api_key=' + API_KEY)
        .send({ email: 'test2@example.com' })
        .expect(200);

      expect(res.body.successstatus).toBe(true);
    });

    // NEGATIVE TESTS
    test('should reject without API key', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .send({ email: 'test@example.com' })
        .expect(401);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Invalid or missing API key');
    });

    test('should reject with invalid API key', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', INVALID_API_KEY)
        .send({ email: 'test@example.com' })
        .expect(401);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without email', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({})
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Email is required');
    });

    test('should reject with invalid email format', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Invalid email format');
    });

    test('should reject with empty email', async () => {
      const res = await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: '' })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     POST /student/auth/verify-otp
     ============================================================ */
  describe('POST /student/auth/verify-otp', () => {
    // POSITIVE TESTS
    test('should verify OTP and return token', async () => {
      const testEmail = 'verify-test@example.com';

      // First send OTP
      await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: testEmail });

      // Then verify
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: testEmail, otp: '1234' })
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('OTP verified successfully');
      expect(res.body.data.email).toBe(testEmail);
      expect(res.body.data.verified).toBe(true);
      expect(res.body.data.token_expires_in).toBe('7d');

      // Check cookie is set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    // NEGATIVE TESTS
    test('should reject without API key', async () => {
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .send({ email: 'test@example.com', otp: '1234' })
        .expect(401);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without email', async () => {
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .set('X-API-Key', API_KEY)
        .send({ otp: '1234' })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Email and OTP are required');
    });

    test('should reject without OTP', async () => {
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Email and OTP are required');
    });

    test('should reject with invalid OTP', async () => {
      const testEmail = 'invalid-otp-test@example.com';

      // Send OTP first
      await request(app)
        .post('/student/auth/send-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: testEmail });

      // Verify with wrong OTP
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: testEmail, otp: '9999' })
        .expect(401);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Invalid or expired OTP');
    });

    test('should reject with invalid email format', async () => {
      const res = await request(app)
        .post('/student/auth/verify-otp')
        .set('X-API-Key', API_KEY)
        .send({ email: 'invalid', otp: '1234' })
        .expect(400);

      expect(res.body.successstatus).toBe(false);
    });
  });

  /* ============================================================
     GET /student/auth/check-auth
     ============================================================ */
  describe('GET /student/auth/check-auth', () => {
    let authCookie;

    beforeAll(async () => {
      // Get authenticated
      const testEmail = 'auth-check@example.com';
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

    // POSITIVE TESTS
    test('should return auth status for authenticated user', async () => {
      const res = await request(app)
        .get('/student/auth/check-auth')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.authenticated).toBe(true);
      expect(res.body.data.email).toBe('auth-check@example.com');
    });

    // NEGATIVE TESTS
    test('should reject without API key', async () => {
      const res = await request(app)
        .get('/student/auth/check-auth')
        .set('Cookie', authCookie)
        .expect(401);

      expect(res.body.successstatus).toBe(false);
    });

    test('should reject without auth cookie', async () => {
      const res = await request(app)
        .get('/student/auth/check-auth')
        .set('X-API-Key', API_KEY)
        .expect(401);

      expect(res.body.successstatus).toBe(false);
      expect(res.body.message).toBe('Token not found!');
    });
  });

  /* ============================================================
     POST /student/auth/logout
     ============================================================ */
  describe('POST /student/auth/logout', () => {
    test('should clear auth cookie on logout', async () => {
      const res = await request(app)
        .post('/student/auth/logout')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  /* ============================================================
     GET /student/auth/me
     ============================================================ */
  describe('GET /student/auth/me', () => {
    let authCookie;

    beforeAll(async () => {
      const testEmail = 'me-test@example.com';
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

    test('should return user info for authenticated user', async () => {
      const res = await request(app)
        .get('/student/auth/me')
        .set('X-API-Key', API_KEY)
        .set('Cookie', authCookie)
        .expect(200);

      expect(res.body.successstatus).toBe(true);
      expect(res.body.data.email).toBe('me-test@example.com');
    });

    test('should reject without authentication', async () => {
      const res = await request(app)
        .get('/student/auth/me')
        .set('X-API-Key', API_KEY)
        .expect(401);

      expect(res.body.successstatus).toBe(false);
    });
  });
});
