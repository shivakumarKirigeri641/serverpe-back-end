function allocateSeat_CC(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10;
  const seatsPerCoach = 78; // typical CC coach (2+3 layout per row)
  const seatTypePreference = ["LADIES", "SENIOR"]; // prioritize WS
const allocated_coach_code='C'
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

  // Each row has 5 seats: Left (2) + Right (3)
  // Pattern repeats every 5 seats → WS, AS, WS, MS, AS
  const modSeat = seatNumberInCoach % 5;
  const seatTypeMap = {
    1: "WS", // Left Window
    2: "AS", // Left Aisle
    3: "WS", // Right Window
    4: "MS", // Right Middle
    0: "AS", // Right Aisle (seat 5)
  };
  let seatType = seatTypeMap[modSeat];

  // Handle special quotas that prefer WS (window seat)
  if (
    quota &&
    seatTypePreference.includes(quota.toUpperCase()) &&
    seatType !== "WS"
  ) {
    const base = Math.floor((seatNumberInCoach - 1) / 5) * 5;
    const possibleWS = [base + 1, base + 3].filter((n) => n <= seatsPerCoach);
    const nearestWS = possibleWS[0] || seatNumberInCoach;
    seatType = "WS";
    return {
      coach_code: `${coach_code}${coachIndex}`,
      seat_number: nearestWS,
      seat_type: seatType,
      allocated_for_quota: quota,
    };
  }

  return {
    coach_code: `${allocated_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    seat_type: seatType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_CC;
