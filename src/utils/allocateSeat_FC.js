function allocateSeat_FC(coach_code, seat_sequence_number, quota = null) {
  const coachesCount = 5; // you can change if required

  // FC typically has both 2-berth coupes and 4-berth cabins
  const compartments = [
    { name: "A", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] }, // 4
    { name: "B", type: "COUPE", berths: ["LB", "UB"] }, // 2
    { name: "C", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] }, // 4
    { name: "D", type: "COUPE", berths: ["LB", "UB"] }, // 2
    { name: "E", type: "CABIN", berths: ["LB", "UB", "LB", "UB"] }, // 4
    { name: "F", type: "COUPE", berths: ["LB", "UB"] }, // 2
    { name: "G", type: "CABIN", berths: ["LB", "UB"] }, // 2 (sometimes smaller)
  ];
  // Total: 22 seats

  const seatsPerCoach = compartments.reduce((a, c) => a + c.berths.length, 0); // = 22

  // Determine coach & seat number in coach
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
    coach_code: `${coach_code}${coachIndex}`,
    seat_number: seatNumberInCoach,
    compartment_name: compartment.name,
    compartment_type: compartment.type,
    berth_type: berthType,
    allocated_for_quota: quota || "general",
  };
}

module.exports = allocateSeat_FC;
