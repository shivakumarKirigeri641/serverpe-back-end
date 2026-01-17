/**
 * ==============================================
 * JEST CONFIGURATION
 * ==============================================
 */

module.exports = {
  testEnvironment: "node",
  verbose: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/app.js", "!**/node_modules/**"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 30000,
};
