const getRandomMobileNumber = () => {
  const prefix = ["9", "8", "7", "6"][Math.floor(Math.random() * 4)];
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return prefix + number.toString();
};
module.exports = getRandomMobileNumber;
