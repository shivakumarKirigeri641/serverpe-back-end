const validatePinCode = (data) => {
  if (!data.pincode) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid pin code!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validatePinCode;
