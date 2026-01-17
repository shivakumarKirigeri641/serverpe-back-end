function allocateSeat_2A(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 10;
  const seatsPerCoach = 46; // typical 2A coach
  const lowerBerthPreference = ["LADIES", "SENIOR", "PWD"];
  const allocated_coach_code='A'
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  const modSeat = seatNumberInCoach % 4;
  const berthTypeMap = {
    1: "LB",
    2: "UB",
    3: "SL",
    0: "SU",
  };
  let berthType = berthTypeMap[modSeat];

  // Lower berth preference if quota exists
  if (
    quota &&
    lowerBerthPreference.includes(quota.toLowerCase()) &&
    berthType !== "LB"
  ) {
    const base = Math.floor((seatNumberInCoach - 1) / 4) * 4;
    const possibleLBs = [base + 1]; // only first in block is LB
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
    coach_code: `${allocated_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_2A;
