/**
 * ==============================================
 * TEST SETUP FILE
 * ==============================================
 * Global test configuration and setup
 */

// Set test environment
process.env.NODE_ENV = "test";
process.env.PORT = "4001";
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.DEMO_API_KEY = "QS_DEMO_API_KEY_2026_STUDENT_TRAIN";
process.env.SERVERPE_BASE_URL = "http://localhost:3000";

// Increase timeout for async operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

// Global test utilities
global.testApiKey = "QS_DEMO_API_KEY_2026_STUDENT_TRAIN";
global.invalidApiKey = "INVALID_API_KEY_12345";

// Mock dates for consistent testing
const mockDate = new Date("2026-01-15T10:00:00.000Z");
