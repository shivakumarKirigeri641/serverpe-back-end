const getRandomDateNext60Days = () => {
  const today = new Date();
  const maxDays = 59;

  // Random number of days to add (0 to 59)
  const randomDays = Math.floor(Math.random() * (maxDays + 1));

  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() + randomDays);

  // Format as YYYY-MM-DD
  const yyyy = randomDate.getFullYear();
  const mm = String(randomDate.getMonth() + 1).padStart(2, "0");
  const dd = String(randomDate.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};
module.exports = getRandomDateNext60Days;
