const validateForPNRStatus = (req) => {
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
      message: "source_code not found!",
    };
  }
  if (!req.body.pnr === "") {
    return {
      statuscode: 400,
      successstatus: false,
      message: "pnr cannot be empty!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForPNRStatus;
