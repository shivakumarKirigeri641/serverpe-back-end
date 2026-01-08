const validateforverifyotp = (data) => {
  if (!data) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!data.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No mobile number present!",
    };
  }
  if (!data.email) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No email present!",
    };
  }
  if (!data.mobile_otp) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Mobile OTP not provided!",
    };
  }
  if (!data.email_otp) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Email OTP not provided!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateforverifyotp;
