function allocateSeat_EC(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 5; // EC coaches are fewer, usually 1–5 per train
  const seatsPerCoach = 56; // typical EC layout: 2+2 per row
  const windowPreference = ["LADIES", "SENIOR"]; // prefer window seats
  const allocated_coach_code='EC'
  // Determine coach index and seat number within the coach
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

  // Each row has 4 seats → pattern repeats every 4 seats:
  // Left (2): WS, AS | Right (2): AS, WS
  // So pattern = WS, AS, AS, WS
  const modSeat = seatNumberInCoach % 4;
  const seatTypeMap = {
    1: "WS", // Left window
    2: "AS", // Left aisle
    3: "AS", // Right aisle
    0: "WS", // Right window
  };
  let seatType = seatTypeMap[modSeat];

  // Handle special quotas preferring window seats
  if (
    quota &&
    windowPreference.includes(quota.toUpperCase()) &&
    seatType !== "WS"
  ) {
    const base = Math.floor((seatNumberInCoach - 1) / 4) * 4;
    const possibleWS = [base + 1, base + 4].filter((n) => n <= seatsPerCoach);
    const nearestWS = possibleWS[0] || seatNumberInCoach;
    seatType = "WS";
    return {
      coach_code: `${coach_code}${coachIndex}`,
      seat_number: nearestWS,
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

module.exports = allocateSeat_EC;
