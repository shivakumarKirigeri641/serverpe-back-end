const validateForLiveTrainRunningStatus = (req) => {
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
      message: "train_number not found!",
    };
  }
  if (!req.body.train_number === "") {
    return {
      statuscode: 400,
      successstatus: false,
      message: "train_number cannot be empty!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForLiveTrainRunningStatus;
