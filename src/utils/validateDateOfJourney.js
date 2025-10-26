const validateDateOfJourney = (journeyDateStr) => {
  // Convert input string to Date
  const journeyDate = new Date(journeyDateStr);
  const today = new Date();

  // Zero out time portion for comparison
  today.setHours(0, 0, 0, 0);

  if (journeyDate < today) {
    return false;
  } else return true; // valid date
};
module.exports = validateDateOfJourney;
