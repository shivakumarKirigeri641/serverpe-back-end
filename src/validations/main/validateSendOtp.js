const validateSendOtp = (bodyjson) => {
  if (!bodyjson) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "No body information present!",
    };
  }
  if (!bodyjson.mobile_number) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "No mobile number present!",
    };
  }
  if (!bodyjson.user_name) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "No name present!",
    };
  }
  if (!bodyjson.stateid) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "state/union territory not selected!",
    };
  }
  let status = /^[6-9]\d{9}$/.test(bodyjson.mobile_number);
  if (false === status) {
    return {
      statuscode: 401,
      successstatus: false,
      message: "Invalid mobile number!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateSendOtp;
