const AppError = require("./AppError");

/**
 * Maps database and application errors into AppError.
 *
 * Handles:
 * - Already raised AppError (HTTP-level errors)
 * - PostgreSQL-specific error codes
 * - Unknown / runtime errors
 */
module.exports = function mapPgError(err) {
  /* -------------------- ALREADY APP ERROR -------------------- */
  if (err instanceof AppError) {
    // Do NOT remap application-level errors (404, 400, etc.)
    return err;
  }

  /* -------------------- POSTGRES ERROR MAPPING -------------------- */
  if (err && err.code) {
    switch (err.code) {
      case "23505": // unique_violation
        return new AppError("Duplicate record detected", 409, "PG_DUPLICATE");

      case "23503": // foreign_key_violation
        return new AppError("Invalid reference data", 400, "PG_FK_VIOLATION");

      case "42P01": // undefined_table
        return new AppError(
          "Database table not found",
          500,
          "PG_TABLE_MISSING"
        );

      case "08006": // connection failure
        return new AppError(
          "Database connection failed",
          503,
          "PG_CONNECTION_FAILED"
        );

      default:
        return new AppError(
          "Database operation failed",
          500,
          "PG_UNKNOWN_ERROR"
        );
    }
  }

  /* -------------------- UNKNOWN / RUNTIME ERROR -------------------- */
  return new AppError("Internal server error", 500, "UNHANDLED_ERROR");
};
