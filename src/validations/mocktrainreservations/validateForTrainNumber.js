const validateForTrainNumber = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.train_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "source_code not found!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForTrainNumber;
