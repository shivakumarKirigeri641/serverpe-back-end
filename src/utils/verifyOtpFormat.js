const verifyOtpFormat = (otp) => {
  if (!otp) {
    return false;
  }
  otp = otp.replace(/\s|-/g, "");
  const regex = /^\d{4}$/;
  return regex.test(otp);
};
module.exports = verifyOtpFormat;
