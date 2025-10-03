const verifyMobileNumber = (mobile_number) => {
  if (!mobile_number) {
    return false;
  }
  mobile_number = mobile_number.replace(/\s|-/g, "");
  const regex = /^[6-9]\d{9}$/;
  return regex.test(mobile_number);
};
module.exports = verifyMobileNumber;
