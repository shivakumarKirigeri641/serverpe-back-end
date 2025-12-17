const validateForCategory = (req) => {
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
  if (!req.body.bike_type) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "bike_type not found!",
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
  if (req.body.bike_type === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "bike_type is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForCategory;
