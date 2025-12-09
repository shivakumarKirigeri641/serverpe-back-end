const validateForTrainsBetweenTwostations = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.source_code) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "source_code not found!",
    };
  }
  if (!req.body.destination_code) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "destination_code not found!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForTrainsBetweenTwostations;
