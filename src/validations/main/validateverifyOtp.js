const validateforverifyotp = (data) => {
  if (!data.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No mobile number present!",
    };
  }
  if (!data.otp) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Otp not provided!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateforverifyotp;
