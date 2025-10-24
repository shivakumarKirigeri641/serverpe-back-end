const checkForValidDate = (dateString) => {
  // Convert input string to Date object (ignoring time)
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0); // normalize to start of day

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to start of day

  return inputDate >= today;
};
module.exports = checkForValidDate;
