const getRandomMobileNumber = () => {
  const mobileNumbers = [
    "9886122415",
    "9900970271",
    "9739622631",
    "9686231591",
    "9845991639",
    "9620158537",
    "9945797695",
    "8296030363",
    "9036394252",
    "8050953841",
    "9535156469",
    "8050642456",
  ];
  if (!Array.isArray(mobileNumbers) || mobileNumbers.length === 0) {
    throw new Error("Invalid or empty mobile number array");
  }
  const randomIndex = Math.floor(Math.random() * mobileNumbers.length);
  return mobileNumbers[randomIndex];
};
module.exports = getRandomMobileNumber;
