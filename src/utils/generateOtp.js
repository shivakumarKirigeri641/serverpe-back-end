const generateOtp = () => {
  return Math.floor(1111 + Math.random() * 9999).toString();
};
module.exports = generateOtp;
