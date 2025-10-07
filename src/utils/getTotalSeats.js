const getTotalSeats = (coachType) => {
  if (!coachType) return 0;

  // Map coach type to total seats
  const coachMap = {
    SL: 72, // Sleeper
    "3A": 64, // 3A
    "2A": 46, // 2A
    "1A": 24, // 1A
    CC: 78, // Chair Car
    EC: 56, // Executive Chair
    E3: 56, // EC variant
    FC: 24, // First Class
  };

  // Use uppercase to avoid case issues
  return coachMap[coachType.toUpperCase()] || 0;
};
module.exports = getTotalSeats;
