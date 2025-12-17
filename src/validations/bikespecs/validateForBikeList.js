const validateForBikeList = (req) => {
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
  if (!req.body.category) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "category not found!",
    };
  }
  /*if (!req.body.year_of_manufacture) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "year_of_manufacture not found!",
    };
  }*/
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
  if (req.body.category === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "category is invalid!",
    };
  }
  /*if (req.body.year_of_manufacture === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "year_of_manufacture is invalid!",
    };
  }*/
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForBikeList;
