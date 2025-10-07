/**
 * Get berth type for Indian Railways coaches
 * @param {string} coachType - '1A', '2A', '3A', 'SL', 'CC', 'EC', 'FC', etc.
 * @param {number} seatNo - seat number within coach
 * @returns {string|null} - berth type like 'LB', 'UB', 'MB', 'SU', 'SL', or null if invalid
 */
function getBerth(coachType, seatNo) {
  // Default values for invalid input
  const defaultResult = {
    berth: null,
    coachDisplayName: coachType || "unknown",
    totalSeats: 0,
  };

  if (!coachType || seatNo < 1) return defaultResult;

  // Map coach type to total seats
  const totalSeatsMap = {
    SL: 72,
    "3A": 64,
    "2A": 46,
    "1A": 24,
    CC: 78,
    EC: 56,
    E3: 56,
    FC: 24,
  };

  const totalSeats = totalSeatsMap[coachType.toUpperCase()];
  if (!totalSeats || seatNo > totalSeats) return defaultResult;

  // Berth patterns
  const patterns = {
    SL: ["LB", "UB", "LB", "UB", "SL", "SU", "SL", "SU"],
    "3A": ["LB", "MB", "UB", "LB", "MB", "UB", "SU", "SU"],
    "2A": ["LB", "UB", "LB", "UB"],
    "1A": ["LB", "UB"],
    FC: ["LB", "UB"],
    CC: ["WS", "MS", "AS", "WS", "MS", "AS"],
    EC: ["WS", "MS", "AS", "WS", "MS", "AS"],
    E3: ["WS", "MS", "AS", "WS", "MS", "AS"],
  };

  const pattern = patterns[coachType.toUpperCase()];
  const berth = pattern ? pattern[(seatNo - 1) % pattern.length] : null;

  return {
    berth,
    coachDisplayName: coachType,
    totalSeats,
  };
}
module.exports = getBerth;
