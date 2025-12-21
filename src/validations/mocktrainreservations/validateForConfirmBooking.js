const validateForConfirmBooking = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.booking_id) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "booking_id not found!",
    };
  }
  //can_send_mock_ticket_sms
  if (null === req.body.can_send_mock_ticket_sms) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "can_send_mock_ticket_sms not found!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForConfirmBooking;
