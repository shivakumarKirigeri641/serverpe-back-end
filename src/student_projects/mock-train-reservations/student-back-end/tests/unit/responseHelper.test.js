/**
 * ==============================================
 * UNIT TESTS - RESPONSE HELPER
 * ==============================================
 */

const {
  sendSuccess,
  sendError,
  sendValidationError,
  HTTP_STATUS,
} = require('../../src/utils/responseHelper');

describe('Response Helper', () => {
  let mockRes;

  beforeEach(() => {
    // Create mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  /* ============================================================
     SUCCESS RESPONSE
     ============================================================ */
  describe('sendSuccess', () => {
    test('should send success response with default status 200', () => {
      const data = { test: 'data' };
      sendSuccess(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'Success',
        successstatus: true,
        data: { test: 'data' },
      }));
    });

    test('should send success response with custom message', () => {
      sendSuccess(mockRes, {}, 'Custom message');

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Custom message',
      }));
    });

    test('should send success response with custom status code', () => {
      sendSuccess(mockRes, {}, 'Created', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should include timestamp', () => {
      sendSuccess(mockRes, {});

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(String),
      }));
    });

    test('should include poweredby field', () => {
      sendSuccess(mockRes, {});

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        poweredby: 'quicksmart-student.serverpe.in',
      }));
    });
  });

  /* ============================================================
     ERROR RESPONSE
     ============================================================ */
  describe('sendError', () => {
    test('should send error response with status code', () => {
      sendError(mockRes, 400, 'Bad request');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'Failed',
        successstatus: false,
        message: 'Bad request',
      }));
    });

    test('should send 404 not found error', () => {
      sendError(mockRes, 404, 'Resource not found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should send 500 internal server error', () => {
      sendError(mockRes, 500, 'Internal server error');

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('should include timestamp', () => {
      sendError(mockRes, 400, 'Error');

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(String),
      }));
    });
  });

  /* ============================================================
     VALIDATION ERROR RESPONSE
     ============================================================ */
  describe('sendValidationError', () => {
    test('should send validation error with formatted errors', () => {
      const errors = [
        { path: 'email', msg: 'Invalid email', value: 'invalid' },
        { path: 'age', msg: 'Age required', value: null },
      ];

      sendValidationError(mockRes, errors);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'email', message: 'Invalid email' }),
          expect.objectContaining({ field: 'age', message: 'Age required' }),
        ]),
      }));
    });
  });

  /* ============================================================
     HTTP STATUS CONSTANTS
     ============================================================ */
  describe('HTTP_STATUS', () => {
    test('should have correct status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });
});
