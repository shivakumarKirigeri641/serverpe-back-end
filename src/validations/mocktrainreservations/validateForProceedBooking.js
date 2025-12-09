const validateForProceedBooking = (req) => {
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
  if (!req.body.doj) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "doj (date of journey) not found!",
    };
  }
  if (!req.body.coach_type) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "coach_type not found!",
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
  if (!req.body.mobile_number) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "mobile_number not found!",
    };
  }
  if (!req.body.reservation_type) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "reservation_type not found!",
    };
  }
  if (!req.body.passenger_details) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "passenger_details not found!",
    };
  }
  if (!req.body.passenger_details === "object") {
    return {
      statuscode: 400,
      successstatus: false,
      message:
        "passenger_details cannot be an object. It must be an array of minimum 1 passenger details!",
    };
  }
  if (0 === req.body.passenger_details.length) {
    return {
      statuscode: 400,
      successstatus: false,
      message:
        "passenger_details must be an array of minimum 1 passenger details!",
    };
  }
  let stopstatus = false;
  let errormsg = "";
  let statuscode = 404;
  for (let i = 0; i < req.passenger_details.length; i++) {
    if (!req.passenger_details[i].passenger_name) {
      errormsg = "passenger_name not found!";
      stopstatus = true;
      break;
    }
    if (!req.passenger_details[i].passenger_age) {
      errormsg = "passenger_age not found!";
      stopstatus = true;
      break;
    }
    if (!req.passenger_details[i].passenger_gender) {
      errormsg = "passenger_gender not found!";
      stopstatus = true;
      break;
    }
    if (2 > req.passenger_details[i].passenger_name.length) {
      errormsg = "passenger_name is very small!";
      statuscode = 400;
      stopstatus = true;
      break;
    }
    if (
      req.passenger_details[i].passenger_gender.toUpperCase() !== "M" &&
      req.passenger_details[i].passenger_gender.toUpperCase() !== "F" &&
      req.passenger_details[i].passenger_gender.toUpperCase() !== "O"
    ) {
      errormsg = "Inavlid passenger_gender!";
      stopstatus = true;
      statuscode = 400;
      break;
    }
    if (!isNumeric(req.passenger_details[i].passenger_age)) {
      errormsg = "Inavlid passenger_age!";
      stopstatus = true;
      statuscode = 400;
      break;
    }
    if (!req.passenger_details[i].passenger_ischild) {
      errormsg = "passenger_ischild status not found!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
    if (!req.passenger_details[i].passenger_issenior) {
      errormsg = "passenger_issenior status not found!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
    if (
      req.passenger_details[i].passenger_age > 6 &&
      req.passenger_details[i].ischild
    ) {
      errormsg = "passenger cannot be a child when age is more then 6!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
    if (
      req.passenger_details[i].passenger_age < 6 &&
      false === req.passenger_details[i].ischild
    ) {
      errormsg = "passenger cannot be a adult when age is less then 6!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
    if (
      req.passenger_details[i].passenger_age > 60 &&
      req.passenger_details[i].passenger_gender.toUpperCase() === "M" &&
      req.passenger_details[i].passenger_issenior === false
    ) {
      errormsg =
        "passenger is senior & male, please make passenger_issenior to true or decrement the age below 60!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
    if (
      req.passenger_details[i].passenger_age > 50 &&
      req.passenger_details[i].passenger_gender.toUpperCase() === "F" &&
      req.passenger_details[i].passenger_issenior === false
    ) {
      errormsg =
        "passenger is senior & female, please make passenger_issenior to true or decrement the age below 50!";
      stopstatus = true;
      statuscode = 404;
      break;
    }
  }
  if (stopstatus) {
    return {
      statuscode: statuscode,
      successstatus: false,
      message: errormsg,
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForProceedBooking;
