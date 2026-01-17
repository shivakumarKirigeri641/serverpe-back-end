/**
 * ==============================================
 * UNIT TESTS - API KEY VALIDATION
 * ==============================================
 */

const {
  validateApiKey,
  hasPermission,
} = require('../../src/config/apiKeys');

describe('API Key Validation', () => {
  const validApiKey = 'QS_DEMO_API_KEY_2026_STUDENT_TRAIN';
  const readOnlyKey = 'QS_READONLY_API_KEY_2026';
  const invalidApiKey = 'INVALID_KEY_12345';

  /* ============================================================
     VALIDATE API KEY
     ============================================================ */
  describe('validateApiKey', () => {
    test('should return key data for valid API key', () => {
      const result = validateApiKey(validApiKey);

      expect(result).not.toBeNull();
      expect(result.key).toBe(validApiKey);
      expect(result.active).toBe(true);
    });

    test('should return null for invalid API key', () => {
      const result = validateApiKey(invalidApiKey);
      expect(result).toBeNull();
    });

    test('should return null for empty API key', () => {
      expect(validateApiKey('')).toBeNull();
      expect(validateApiKey(null)).toBeNull();
      expect(validateApiKey(undefined)).toBeNull();
    });

    test('should return null for non-string API key', () => {
      expect(validateApiKey(123)).toBeNull();
      expect(validateApiKey({})).toBeNull();
      expect(validateApiKey([])).toBeNull();
    });

    test('should return key details with permissions', () => {
      const result = validateApiKey(validApiKey);

      expect(result.permissions).toContain('read');
      expect(result.permissions).toContain('write');
    });
  });

  /* ============================================================
     PERMISSION CHECKS
     ============================================================ */
  describe('hasPermission', () => {
    test('should return true for key with read permission', () => {
      expect(hasPermission(validApiKey, 'read')).toBe(true);
    });

    test('should return true for key with write permission', () => {
      expect(hasPermission(validApiKey, 'write')).toBe(true);
    });

    test('should return false for read-only key with write permission', () => {
      expect(hasPermission(readOnlyKey, 'write')).toBe(false);
    });

    test('should return true for read-only key with read permission', () => {
      expect(hasPermission(readOnlyKey, 'read')).toBe(true);
    });

    test('should return false for invalid API key', () => {
      expect(hasPermission(invalidApiKey, 'read')).toBe(false);
      expect(hasPermission(invalidApiKey, 'write')).toBe(false);
    });
  });
});
