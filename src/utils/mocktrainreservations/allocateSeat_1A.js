function allocateSeat_1A(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 5; // Typically few 1A coaches
  const allocated_coach_code='H'
  const compartments = [
    { name: "A", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] },
    { name: "B", type: "COUPE", berths: ["LB", "UB"] },
    { name: "C", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] },
    { name: "D", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] },
    { name: "E", type: "COUPE", berths: ["LB", "UB"] },
    { name: "F", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] },
    { name: "G", type: "COUPE", berths: ["LB", "UB"] },
    { name: "H", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] },
  ];

  // Calculate total seats per coach dynamically
  const seatsPerCoach = compartments.reduce((a, c) => a + c.berths.length, 0); // 26 seats total

  // Determine coach & seat position
  const coachIndex = Math.floor((seat_sequence_number - 1) / seatsPerCoach) + 1;
  const seatNumberInCoach = ((seat_sequence_number - 1) % seatsPerCoach) + 1;

  if (coachIndex > coachesCount) {
    return {
      error: `Seat sequence ${seat_sequence_number} exceeds available seats (${
        coachesCount * seatsPerCoach
      })`,
    };
  }

  // Find which compartment the seat belongs to
  let remaining = seatNumberInCoach;
  let compartment = null;
  for (const comp of compartments) {
    if (remaining <= comp.berths.length) {
      compartment = comp;
      break;
    }
    remaining -= comp.berths.length;
  }

  const berthType = compartment.berths[remaining - 1];

  return {
    coach_code: `${allocated_coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    compartment_name: compartment.name,
    compartment_type: compartment.type,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_1A;
