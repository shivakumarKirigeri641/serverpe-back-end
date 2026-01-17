function allocateSeat_EA(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10; // assume 10 EA coaches
  const seatsPerCoach = 56; // typical Executive Anubhuti coach
  const preferenceSeats = ["LADIES", "SENIOR", "PWD"]; // preference may still apply
  const allocated_coach_code='EA'
  // Compute coach and seat number within coach
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  // Validate seat range
  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  // Pattern for 2x2 layout (4 seats per row)
  // 1: W, 2: A, 3: A, 0: W
  const modSeat = seatNumberInCoach % 4;
  const seatTypeMap = {
    1: "W", // Window
    2: "A", // Aisle
    3: "A", // Aisle
    0: "W", // Window
  };
  let seatType = seatTypeMap[modSeat];

  // Apply quota preference (e.g., prefer window seat)
  if (
    quota &&
    preferenceSeats.includes(quota.toUpperCase()) &&
    seatType !== "W"
  ) {
    const base = Math.floor((seatNumberInCoach - 1) / 4) * 4;
    const possibleWs = [base + 1, base + 4].filter((n) => n <= seatsPerCoach);
    const nearestW = possibleWs[0] || seatNumberInCoach;
    seatType = "W";
    return {
      coach_code: `${coach_code}${coachIndex}`,
      seat_number: nearestW,
      seat_type: seatType,
      allocated_for_quota: quota,
    };
  }

  // Normal seat allocation
  return {
    coach_code: `${allocated_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    seat_type: seatType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_EA;
