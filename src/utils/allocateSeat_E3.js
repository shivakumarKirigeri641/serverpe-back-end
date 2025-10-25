function allocateSeat_E3(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10; // typical number of E3 coaches
  const seatsPerCoach = 83; // 3A Economy coaches have 83 berths
  const lowerBerthPreference = ["LADIES", "SENIOR"];

  // Determine coach index and seat number within coach
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  // Validate seat sequence range
  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  // Pattern repeats every 8 berths: LB, MB, UB, LB, MB, UB, SL, SU
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

  // Apply quota-based lower berth preference
  if (
    quota &&
    lowerBerthPreference.includes(quota.toUpperCase()) &&
    berthType !== "LB"
  ) {
    const base = Math.floor((seatNumberInCoach - 1) / 8) * 8;
    const possibleLBs = [base + 1, base + 4].filter((n) => n <= seatsPerCoach);
    const nearestLB = possibleLBs[0] || seatNumberInCoach;
    berthType = "LB";
    return {
      coach_code: `${coach_code}${coachIndex}`,
      seat_number: nearestLB,
      berth_type: berthType,
      allocated_for_quota: quota,
    };
  }

  // Normal allocation
  return {
    coach_code: `${coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_E3;
