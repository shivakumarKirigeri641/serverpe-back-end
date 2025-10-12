const getFCSeatDetails = (seatNumber) => {
  const seatsPerCoach = 22;
  const coachNumber = Math.ceil(seatNumber / seatsPerCoach);
  const seatPosition = ((seatNumber - 1) % seatsPerCoach) + 1;

  // Determine berth type
  const berthType = seatPosition % 2 === 1 ? "LB" : "UB";

  // All seats are in Cabins
  const compartmentType = "Cabin";

  return {
    coach: `FC${coachNumber}`,
    seatPosition,
    berthType,
    compartmentType,
  };
};
module.exports = getFCSeatDetails;
