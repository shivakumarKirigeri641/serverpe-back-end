const isNumeric = require("../main/isNumeric");
const validateForLiveStation = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.station_code) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "station_code not found!",
    };
  }
  if (!req.body.next_hours) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "next_hours not found!",
    };
  }
  if (!req.body.statin_code === "") {
    return {
      statuscode: 400,
      successstatus: false,
      message: "statin_code be empty!",
    };
  }
  if (!req.body.next_hours === "") {
    return {
      statuscode: 400,
      successstatus: false,
      message: "next_hours be empty!",
    };
  }
  if (!isNumeric(req.body.next_hours)) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "next_hours is invalid!",
    };
  }
  if (
    req.body.next_hours !== 2 &&
    req.body.next_hours !== 4 &&
    req.body.next_hours !== 8
  ) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "next_hours has invalid value!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForLiveStation;
