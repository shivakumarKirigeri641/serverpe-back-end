const get1ASeatDetails = (seatNumber) => {
  const seatsPerCoach = 22;
  const coachNumber = Math.ceil(seatNumber / seatsPerCoach);
  const seatPosition = ((seatNumber - 1) % seatsPerCoach) + 1;

  // Determine berth type
  let berthType = seatPosition % 2 === 1 ? "LB" : "UB";

  // Determine compartment type
  let compartmentType;
  if (seatPosition <= 10) {
    compartmentType = "Cabin";
  } else if (seatPosition <= 12) {
    compartmentType = "Coupe";
  } else if (seatPosition <= 14) {
    compartmentType = "Cabin";
  } else if (seatPosition <= 16) {
    compartmentType = "Cabin";
  } else if (seatPosition <= 18) {
    compartmentType = "Cabin";
  } else if (seatPosition <= 20) {
    compartmentType = "Cabin";
  } else {
    compartmentType = "Coupe";
  }

  return {
    coach: `1A${coachNumber}`,
    seatPosition,
    berthType,
    compartmentType,
  };
};
module.exports = get1ASeatDetails;
