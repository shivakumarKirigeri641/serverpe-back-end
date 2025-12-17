const validateForGrades = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.brand) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "brand not found!",
    };
  }
  if (!req.body.model) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "model not found!",
    };
  }
  if (!req.body.series) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Series not found!",
    };
  }
  if (req.body.brand === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "brand is invalid!",
    };
  }
  if (req.body.model === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "model is invalid!",
    };
  }
  if (req.body.series === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "series is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForGrades;
