/**
 * ==============================================
 * UNIT TESTS - VALIDATORS
 * ==============================================
 */

const {
  isValidEmail,
  isValidDate,
  isNotPastDate,
  validatePassengers,
  isValidOtp,
  isValidPnr,
  isValidStationCode,
  isValidTrainNumber,
  sanitizeString,
  toUpperCase,
} = require("../../src/utils/validators");

describe("Validators", () => {
  /* ============================================================
     EMAIL VALIDATION
     ============================================================ */
  describe("isValidEmail", () => {
    test("should return true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.in")).toBe(true);
      expect(isValidEmail("user+tag@gmail.com")).toBe(true);
    });

    test("should return false for invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  /* ============================================================
     DATE VALIDATION
     ============================================================ */
  describe("isValidDate", () => {
    test("should return true for valid date formats", () => {
      expect(isValidDate("2026-01-15")).toBe(true);
      expect(isValidDate("2026-12-31")).toBe(true);
      expect(isValidDate("2025-02-28")).toBe(true);
    });

    test("should return false for invalid date formats", () => {
      expect(isValidDate("")).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate("15-01-2026")).toBe(false);
      expect(isValidDate("2026/01/15")).toBe(false);
      expect(isValidDate("01-15-2026")).toBe(false);
      expect(isValidDate("invalid")).toBe(false);
    });

    test("should return false for invalid dates", () => {
      expect(isValidDate("2026-02-30")).toBe(false); // Feb 30 doesn't exist
      expect(isValidDate("2026-13-01")).toBe(false); // Month 13 doesn't exist
    });
  });

  describe("isNotPastDate", () => {
    test("should return true for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split("T")[0];
      expect(isNotPastDate(futureDateStr)).toBe(true);
    });

    test("should return true for today", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(isNotPastDate(today)).toBe(true);
    });

    test("should return false for past dates", () => {
      expect(isNotPastDate("2020-01-01")).toBe(false);
      expect(isNotPastDate("2024-01-01")).toBe(false);
    });
  });

  /* ============================================================
     PASSENGER VALIDATION
     ============================================================ */
  describe("validatePassengers", () => {
    test("should return valid for correct passenger data", () => {
      const passengers = [
        {
          passenger_name: "John Doe",
          passenger_age: 30,
          passenger_gender: "M",
        },
        {
          passenger_name: "Jane Doe",
          passenger_age: 28,
          passenger_gender: "F",
        },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should return invalid for empty passengers array", () => {
      const result = validatePassengers([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("At least one passenger is required");
    });

    test("should return invalid for non-array passengers", () => {
      const result = validatePassengers(null);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for too many passengers", () => {
      const passengers = Array(7).fill({
        passenger_name: "Test User",
        passenger_age: 25,
        passenger_gender: "M",
      });
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Maximum 6 passengers");
    });

    test("should return invalid for missing passenger name", () => {
      const passengers = [{ passenger_age: 30, passenger_gender: "M" }];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for short passenger name", () => {
      const passengers = [
        { passenger_name: "A", passenger_age: 30, passenger_gender: "M" },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for invalid age", () => {
      const passengers = [
        {
          passenger_name: "John Doe",
          passenger_age: -1,
          passenger_gender: "M",
        },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for age over 120", () => {
      const passengers = [
        {
          passenger_name: "John Doe",
          passenger_age: 150,
          passenger_gender: "M",
        },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for missing gender", () => {
      const passengers = [{ passenger_name: "John Doe", passenger_age: 30 }];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should return invalid for invalid gender", () => {
      const passengers = [
        {
          passenger_name: "John Doe",
          passenger_age: 30,
          passenger_gender: "X",
        },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(false);
    });

    test("should accept valid gender options M, F, O", () => {
      const passengers = [
        {
          passenger_name: "Person 1",
          passenger_age: 30,
          passenger_gender: "M",
        },
        {
          passenger_name: "Person 2",
          passenger_age: 25,
          passenger_gender: "F",
        },
        {
          passenger_name: "Person 3",
          passenger_age: 20,
          passenger_gender: "O",
        },
      ];
      const result = validatePassengers(passengers);
      expect(result.isValid).toBe(true);
    });
  });

  /* ============================================================
     OTP VALIDATION
     ============================================================ */
  describe("isValidOtp", () => {
    test("should return true for valid 4-digit OTP", () => {
      expect(isValidOtp("1234")).toBe(true);
      expect(isValidOtp("0000")).toBe(true);
      expect(isValidOtp("9999")).toBe(true);
    });

    test("should return false for invalid OTPs", () => {
      expect(isValidOtp("")).toBe(false);
      expect(isValidOtp(null)).toBe(false);
      expect(isValidOtp("123")).toBe(false); // Too short
      expect(isValidOtp("12345")).toBe(false); // Too long
      expect(isValidOtp("abcd")).toBe(false); // Not numeric
      expect(isValidOtp("12a4")).toBe(false); // Contains letter
    });
  });

  /* ============================================================
     PNR VALIDATION
     ============================================================ */
  describe("isValidPnr", () => {
    test("should return true for valid PNR formats", () => {
      expect(isValidPnr("ABC123")).toBe(true);
      expect(isValidPnr("123456")).toBe(true);
      expect(isValidPnr("ABCD1234")).toBe(true);
      expect(isValidPnr("A1B2C3D4E5")).toBe(true);
    });

    test("should return false for invalid PNR formats", () => {
      expect(isValidPnr("")).toBe(false);
      expect(isValidPnr(null)).toBe(false);
      expect(isValidPnr("ABC")).toBe(false); // Too short
      expect(isValidPnr("A1B2C3D4E5F6")).toBe(false); // Too long
      expect(isValidPnr("ABC-123")).toBe(false); // Contains special char
    });
  });

  /* ============================================================
     STATION CODE VALIDATION
     ============================================================ */
  describe("isValidStationCode", () => {
    test("should return true for valid station codes", () => {
      expect(isValidStationCode("NDLS")).toBe(true);
      expect(isValidStationCode("MAS")).toBe(true);
      expect(isValidStationCode("HWH")).toBe(true);
      expect(isValidStationCode("BCT")).toBe(true);
    });

    test("should return false for invalid station codes", () => {
      expect(isValidStationCode("")).toBe(false);
      expect(isValidStationCode(null)).toBe(false);
      expect(isValidStationCode("N")).toBe(false); // Too short
      expect(isValidStationCode("NDLSXX")).toBe(false); // Too long
      expect(isValidStationCode("ND1S")).toBe(false); // Contains number
    });
  });

  /* ============================================================
     TRAIN NUMBER VALIDATION
     ============================================================ */
  describe("isValidTrainNumber", () => {
    test("should return true for valid train numbers", () => {
      expect(isValidTrainNumber("12951")).toBe(true);
      expect(isValidTrainNumber("1234")).toBe(true);
      expect(isValidTrainNumber("123456")).toBe(true);
    });

    test("should return false for invalid train numbers", () => {
      expect(isValidTrainNumber("")).toBe(false);
      expect(isValidTrainNumber(null)).toBe(false);
      expect(isValidTrainNumber("123")).toBe(false); // Too short
      expect(isValidTrainNumber("1234567")).toBe(false); // Too long
    });
  });

  /* ============================================================
     STRING UTILITIES
     ============================================================ */
  describe("sanitizeString", () => {
    test("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });

    test("should remove < and > characters", () => {
      expect(sanitizeString("<script>alert(1)</script>")).toBe(
        "scriptalert(1)/script"
      );
    });

    test("should return empty string for non-strings", () => {
      expect(sanitizeString(null)).toBe("");
      expect(sanitizeString(undefined)).toBe("");
      expect(sanitizeString(123)).toBe("");
    });
  });

  describe("toUpperCase", () => {
    test("should convert to uppercase and trim", () => {
      expect(toUpperCase("  hello  ")).toBe("HELLO");
      expect(toUpperCase("ndls")).toBe("NDLS");
    });

    test("should return empty string for non-strings", () => {
      expect(toUpperCase(null)).toBe("");
      expect(toUpperCase(undefined)).toBe("");
    });
  });
});
