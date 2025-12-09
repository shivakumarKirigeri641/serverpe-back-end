const validatePinCode = (data) => {
  if (!data.pincode) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Pin code not found!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validatePinCode;
