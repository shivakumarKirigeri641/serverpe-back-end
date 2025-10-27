const checkIfDateIsTomorrow = (dateStr) => {
  const inputDate = new Date(dateStr);
  const today = new Date();

  // Normalize both to midnight (ignore time)
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const diffDays = (inputDate - today) / (1000 * 60 * 60 * 24);

  return diffDays === 1;
};
module.exports = checkIfDateIsTomorrow;
