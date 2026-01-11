function allocateSeat_2S(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10;
  const allocated_coach_code='D'
  const seatsPerCoach = 108; // typical 2S coach
  const seatTypePreference = ["LADIES", "SENIOR"]; // priority for window or aisle

  // Determine coach index and seat number within the coach
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  // Each row typically has 3 seats on each side (3+3 = 6 per row)
  // Pattern: WS, MS, AS, AS, MS, WS → repeats every 6 seats
  const modSeat = seatNumberInCoach % 6;
  const seatTypeMap = {
    1: "WS",
    2: "MS",
    3: "AS",
    4: "AS",
    5: "MS",
    0: "WS",
  };
  let seatType = seatTypeMap[modSeat];

  // Handle special quota preferences
  if (quota && seatTypePreference.includes(quota.toUpperCase())) {
    // Prefer Window Seat (WS) for these quotas
    if (seatType !== "WS") {
      const base = Math.floor((seatNumberInCoach - 1) / 6) * 6;
      const possibleWS = [base + 1, base + 6].filter((n) => n <= seatsPerCoach);
      const nearestWS = possibleWS[0] || seatNumberInCoach;
      seatType = "WS";
      return {
        coach_code: `${coach_code}${coachIndex}`,
        seat_number: nearestWS,
        seat_type: seatType,
        allocated_for_quota: quota,
      };
    }
  }

  return {
    coach_code: `${allocated_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    seat_type: seatType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_2S;
