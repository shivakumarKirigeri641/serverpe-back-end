function allocateSeat_3A(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10;
  const seatsPerCoach = 64;
  const lowerBerthPreference = ["LADIES", "SENIOR", "PWD"];

  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

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

  if (
    quota &&
    lowerBerthPreference.includes(quota.toLowerCase()) &&
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

  return {
    coach_code: `${coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_3A;
