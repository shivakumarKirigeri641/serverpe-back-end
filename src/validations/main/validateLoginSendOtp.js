const validator = require('validator');

const validateLoginSendOtp = (bodyjson) => {
  if (!bodyjson) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }

  // Check if input_field is provided
  if (!bodyjson.input_field) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Please provide ID (Mobile Number or Email) to login!",
    };
  }

  const input = bodyjson.input_field;
  let isValid = false;

  // Check if it looks like a mobile number
  if (/^[6-9]\d{9}$/.test(input)) {
    isValid = true;
  }
  // Check if it looks like an email
  else if (validator.isEmail(input)) {
    isValid = true;
  }

  if (!isValid) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid Mobile Number or Email!",
    };
  }

  return { statuscode: 200, successstatus: true, message: "success" };
};

module.exports = validateLoginSendOtp;
