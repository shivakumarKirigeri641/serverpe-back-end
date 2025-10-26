const getHoursUntilDeparture = (date_of_journey, scheduled_departure) => {
  // Normalize date (handles "2025-11-1" → "2025-11-01")
  const [year, month, day] = date_of_journey.split("-").map(Number);
  const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  // Combine date and time
  const departureDateTime = new Date(`${formattedDate}T${scheduled_departure}`);

  // Current time
  const now = new Date();

  // Calculate time difference (milliseconds)
  const diffMs = departureDateTime - now;

  if (diffMs < 0) return 0; // already departed

  // Convert to integer hours
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  return diffHours;
};
module.exports = getHoursUntilDeparture;
