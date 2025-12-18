const isNumeric = require("../../validations/main/isNumeric");
const validateForCancelTicket = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.pnr) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "pnr not found!",
    };
  }
  if (!req.body.passengerids) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "passenger ids not found!",
    };
  }
  if (!req.body.passengerids === "object") {
    return {
      statuscode: 400,
      successstatus: false,
      message:
        "passenger_details cannot be an object. It must be an array of minimum 1 passenger details!",
    };
  }
  if (0 === req.body.passengerids.length) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "passengerIDs must be an array of minimum 1 passenger id!",
    };
  }
  let stopstatus = false;
  let errormsg = "";
  let statuscode = 404;
  for (let i = 0; i < req.body.passengerids.length; i++) {
    if (!isNumeric(req.body.passengerids[i])) {
      errormsg = "Inavlid passenger_id!";
      stopstatus = true;
      statuscode = 400;
      break;
    }
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForCancelTicket;
