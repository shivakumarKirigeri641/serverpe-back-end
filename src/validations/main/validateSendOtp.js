const validator = require('validator');
const validateSendOtp = (bodyjson) => {
  if (!bodyjson) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  
  // Validate User Name
  if (!bodyjson.user_name) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "User name not provided!",
    };
  }
  // Allow letters, spaces, and common name characters. Min length 3.
  if (!/^[a-zA-Z\s]{3,}$/.test(bodyjson.user_name)) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid user name! Must be at least 3 characters and contain only letters and spaces.",
    };
  }

  // Validate Mobile Number
  if (!bodyjson.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No mobile number present!",
    };
  }
  if (!/^[6-9]\d{9}$/.test(bodyjson.mobile_number)) {
     return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid mobile number!",
    };
  }

  // Validate Email
  if (!bodyjson.email) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "email not provided!",
    };
  }
  if(!validator.isEmail(bodyjson.email)){
    return {
      statuscode: 401,
      successstatus: false,
      message: "email invalid!",
    };
  }

  // Validate College ID
  if (!bodyjson.collegeid) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "College ID not provided!",
    };
  }
  if (isNaN(bodyjson.collegeid)) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid college ID!",
    };
  }

  // Validate State ID
  if (!bodyjson.stateid) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "State ID not provided!",
    };
  }
  
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateSendOtp;
