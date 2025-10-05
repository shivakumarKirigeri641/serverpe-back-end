const { connectDB } = require("../database/connectDB");
const reserveSeats = require("../SQL/reservations/reserveSeats");
const confirmTicket = async (client, bookingid, total_fare) => {
  let booking_details = {};
  try {
    result_bookingdata = await client.query(
      "select *from bookingdata where id=$1",
      [bookingid]
    );
    //use 'ON UPDATE' in select query for locking row wise
    //then check coach_type
    //check reservation_type

    switch (result_bookingdata.rows[0].reservation_type.toUpperCase()) {
      case "GEN":
        switch (result_bookingdata.rows[0].coach_type.toUpperCase()) {
          case "1A":
            break;
          case "2A":
            break;
          case "3A":
            break;
          case "CC":
            break;
          case "EC":
            break;
          case "E3":
            break;
          case "EA":
            break;
          case "FC":
            break;
          default: //sleeper
            booking_details = await reserveSeats(
              client,
              "sl",
              "GEN",
              bookingid,
              total_fare
            );
            break;
        }
        break;
      case "TTL":
        switch (result_bookingdata.rows[0].coach_type) {
          case "1A":
            break;
          case "2A":
            break;
          case "3A":
            break;
          case "CC":
            break;
          case "EC":
            break;
          case "E3":
            break;
          case "EA":
            break;
          case "FC":
            break;
          default: //sleeper
            break;
        }
        break;
      case "PTL":
        switch (result_bookingdata.rows[0].coach_type) {
          case "1A":
            break;
          case "2A":
            break;
          case "3A":
            break;
          case "CC":
            break;
          case "EC":
            break;
          case "E3":
            break;
          case "EA":
            break;
          case "FC":
            break;
          default: //sleeper
            break;
        }
        break;
    }
    return booking_details;
  } catch (err) {
    throw err;
  }
};
module.exports = confirmTicket;
