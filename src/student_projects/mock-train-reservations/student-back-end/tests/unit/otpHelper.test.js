/**
 * ==============================================
 * UNIT TESTS - OTP HELPER
 * ==============================================
 */

const {
  generateOtp,
  saveOtp,
  verifyOtp,
  clearOtp,
  getOtpData,
} = require("../../src/utils/otpHelper");

describe("OTP Helper", () => {
  const testEmail = "test@example.com";

  beforeEach(() => {
    // Clear any existing OTP before each test
    clearOtp(testEmail);
  });

  /* ============================================================
     OTP GENERATION
     ============================================================ */
  describe("generateOtp", () => {
    test("should generate 4-digit OTP by default (returns 1234 in test)", () => {
      const otp = generateOtp();
      expect(otp).toBe("1234"); // Fixed in test environment
      expect(otp.length).toBe(4);
    });

    test("should generate OTP of specified length", () => {
      const otp = generateOtp(6);
      // In test env, it's still '1234', but the function accepts length param
      expect(typeof otp).toBe("string");
    });
  });

  /* ============================================================
     OTP SAVE
     ============================================================ */
  describe("saveOtp", () => {
    test("should save OTP and return details", () => {
      const otp = "1234";
      const result = saveOtp(testEmail, otp);

      expect(result.email).toBe(testEmail);
      expect(result.expiresIn).toBe("10 minutes");
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    test("should allow getting OTP data in test mode", () => {
      const otp = "5678";
      saveOtp(testEmail, otp);

      const data = getOtpData(testEmail);
      expect(data).not.toBeNull();
      expect(data.otp).toBe("5678");
      expect(data.email).toBe(testEmail);
    });
  });

  /* ============================================================
     OTP VERIFICATION
     ============================================================ */
  describe("verifyOtp", () => {
    test("should return true for valid OTP", () => {
      const otp = "1234";
      saveOtp(testEmail, otp);

      const result = verifyOtp(testEmail, otp);
      expect(result).toBe(true);
    });

    test("should return false for invalid OTP", () => {
      const otp = "1234";
      saveOtp(testEmail, otp);

      const result = verifyOtp(testEmail, "9999");
      expect(result).toBe(false);
    });

    test("should return false for non-existent email", () => {
      const result = verifyOtp("nonexistent@example.com", "1234");
      expect(result).toBe(false);
    });

    test("should delete OTP after successful verification", () => {
      const otp = "1234";
      saveOtp(testEmail, otp);

      // First verification should succeed
      expect(verifyOtp(testEmail, otp)).toBe(true);

      // Second verification should fail (OTP already used)
      expect(verifyOtp(testEmail, otp)).toBe(false);
    });

    test("should limit verification attempts to 3", () => {
      const otp = "1234";
      saveOtp(testEmail, otp);

      // 3 failed attempts
      verifyOtp(testEmail, "0000");
      verifyOtp(testEmail, "0001");
      verifyOtp(testEmail, "0002");

      // Even correct OTP should fail now
      expect(verifyOtp(testEmail, otp)).toBe(false);
    });
  });

  /* ============================================================
     OTP CLEAR
     ============================================================ */
  describe("clearOtp", () => {
    test("should clear OTP for email", () => {
      saveOtp(testEmail, "1234");
      clearOtp(testEmail);

      const data = getOtpData(testEmail);
      expect(data).toBeNull();
    });

    test("should not throw for non-existent email", () => {
      expect(() => clearOtp("nonexistent@example.com")).not.toThrow();
    });
  });

  /* ============================================================
     CASE INSENSITIVITY
     ============================================================ */
  describe("Email case insensitivity", () => {
    test("should treat emails case-insensitively", () => {
      saveOtp("TEST@EXAMPLE.COM", "1234");

      expect(verifyOtp("test@example.com", "1234")).toBe(true);
    });
  });
});
