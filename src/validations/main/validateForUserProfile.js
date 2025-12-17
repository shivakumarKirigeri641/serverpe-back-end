const validateForUserProfile = (bodyjson) => {
  if (!bodyjson) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!bodyjson.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No mobile number present!",
    };
  }
  if (!bodyjson.user_name) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "No name present!",
    };
  }
  if (!bodyjson.myemail) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "email not present!",
    };
  }
  if (!bodyjson.myemail_verifystatus) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "email status not present!",
    };
  }

  if (bodyjson.myemail && !validator.isEmail(bodyjson.myemail)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "emailid invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForUserProfile;
