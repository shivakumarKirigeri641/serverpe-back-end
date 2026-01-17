/**
 * ==============================================
 * UNIT TESTS - CUSTOM ERRORS
 * ==============================================
 */

const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
} = require('../../src/utils/errors');

describe('Custom Errors', () => {
  /* ============================================================
     APP ERROR
     ============================================================ */
  describe('AppError', () => {
    test('should create error with message and status code', () => {
      const error = new AppError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
    });

    test('should default to 500 status code', () => {
      const error = new AppError('Test error');
      expect(error.statusCode).toBe(500);
    });

    test('should include details if provided', () => {
      const error = new AppError('Test error', 500, { extra: 'info' });
      expect(error.details).toEqual({ extra: 'info' });
    });

    test('should be instance of Error', () => {
      const error = new AppError('Test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  /* ============================================================
     VALIDATION ERROR
     ============================================================ */
  describe('ValidationError', () => {
    test('should create error with 400 status code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  /* ============================================================
     AUTHENTICATION ERROR
     ============================================================ */
  describe('AuthenticationError', () => {
    test('should create error with 401 status code', () => {
      const error = new AuthenticationError('Not authenticated');

      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    test('should have default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
    });
  });

  /* ============================================================
     AUTHORIZATION ERROR
     ============================================================ */
  describe('AuthorizationError', () => {
    test('should create error with 403 status code', () => {
      const error = new AuthorizationError('Forbidden');

      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    test('should have default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Access denied');
    });
  });

  /* ============================================================
     NOT FOUND ERROR
     ============================================================ */
  describe('NotFoundError', () => {
    test('should create error with 404 status code', () => {
      const error = new NotFoundError('Train not found');

      expect(error.message).toBe('Train not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    test('should have default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  /* ============================================================
     CONFLICT ERROR
     ============================================================ */
  describe('ConflictError', () => {
    test('should create error with 409 status code', () => {
      const error = new ConflictError('Already booked');

      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  /* ============================================================
     RATE LIMIT ERROR
     ============================================================ */
  describe('RateLimitError', () => {
    test('should create error with 429 status code', () => {
      const error = new RateLimitError('Too many requests');

      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  /* ============================================================
     EXTERNAL SERVICE ERROR
     ============================================================ */
  describe('ExternalServiceError', () => {
    test('should create error with 503 status code', () => {
      const error = new ExternalServiceError('API unavailable');

      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('ExternalServiceError');
    });

    test('should have default message', () => {
      const error = new ExternalServiceError();
      expect(error.message).toBe('External service unavailable');
    });
  });
});
