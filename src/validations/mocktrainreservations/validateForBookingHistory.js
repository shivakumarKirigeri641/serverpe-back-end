const validateForBookingHistory = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "mobile_number not found!",
    };
  }
  if (req.body.mobile_number.length !== 10) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "mobile_number is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForBookingHistory;
