function allocateSeat_SL(coach_code, seat_sequence_number, quota = null) {
  // Configuration
  const coachesCount = 10;
  const assigned_coach_code='S';
  const seatsPerCoach = 72;
  const lowerBerthPreference = ["LADIES", "SENIOR", "PWD"];

  // Compute coach index and seat number within coach
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  // Validate coach index
  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  // Compute berth type (pattern repeats every 8)
  const modSeat = seatNumberInCoach % 8;
  const berthTypeMap = {
    1: "LB",
    2: "MB",
    3: "UB",
    4: "LB",
    5: "MB",
    6: "UB",
    7: "SL",
    0: "SU",
  };
  let berthType = berthTypeMap[modSeat];

  // Lower berth preference if available
  if (quota && lowerBerthPreference.includes(quota.toLowerCase())) {
    // If not already LB, try to adjust to a nearby LB seat (simulate)
    if (berthType !== "LB") {
      // Try nearest LB in same 8-seat block
      const base = Math.floor((seatNumberInCoach - 1) / 8) * 8;
      const possibleLBs = [base + 1, base + 4];
      const nearestLB = possibleLBs.find((n) => n <= seatsPerCoach);
      berthType = "LB";
      return {
        coach_code: `${coach_code}${coachIndex}`,
        seat_number: nearestLB,
        berth_type: berthType,
        allocated_for_quota: quota,
      };
    }
  }

  // Normal allocation
  return {
    coach_code: `${assigned_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}
module.exports = allocateSeat_SL;
