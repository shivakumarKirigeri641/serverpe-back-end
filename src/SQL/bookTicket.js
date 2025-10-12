const book_sl_gen = require("./reservations/SL/book_sl_gen");
const book_sl_ttl = require("./reservations/SL/book_sl_ttl");
const book_sl_ptl = require("./reservations/SL/book_sl_ptl");
const book_sl_ladies = require("./reservations/SL/book_sl_ladies");
const book_sl_senior = require("./reservations/SL/book_sl_senior");
const book_sl_duty = require("./reservations/SL/book_sl_duty");
const book_sl_pwd = require("./reservations/SL/book_sl_pwd");
const generatePNR = require("../utils/generatePNR");
const calculatefare = require("../SQL/calculatefare");
const book_sl_seniors = require("./reservations/SL/book_sl_senior");
const bookTicket = async (client, bookingid) => {
  let booked_details = null;
  let result_bookingdata = await client.query(
    "select *from bookingdata where id=$1",
    [bookingid]
  );
  result_passengerdata = await client.query(
    "select *from passengerdata where fkbookingdata=$1",
    [bookingid]
  );
  let result_ticketdata = null;
  try {
    if (
      0 === result_bookingdata.rows.length ||
      true === result_bookingdata.rows[0].proceed_status
    ) {
      throw {
        success: false,
        message: "booking-id not found!",
        data: {},
      };
    } else {
    }
    let fare_details = await calculatefare(
      client,
      result_bookingdata.rows[0],
      result_passengerdata.rows,
      result_bookingdata.rows[0].adult_count,
      result_bookingdata.rows[0].child_count
    );
    let total_fare =
      (fare_details.total_base_fare +
        (fare_details.total_base_fare * fare_details.convience_fee_percent) /
          100 +
        (fare_details.total_base_fare * fare_details.GST) / 100 +
        (fare_details.total_base_fare * fare_details.card_charges_percent) /
          100) *
      result_bookingdata.rows[0].adult_count;
    switch (result_bookingdata.rows[0].coach_type) {
      case "SL":
        switch (result_bookingdata.rows[0].reservation_type) {
          case "GEN":
            booked_details = await book_sl_gen(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "TTL":
            booked_details = await book_sl_ttl(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "PTL":
            booked_details = await book_sl_ptl(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "LADIES":
            booked_details = await book_sl_ladies(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "DUTY":
            booked_details = await book_sl_duty(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "PWD":
            booked_details = await book_sl_pwd(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
          case "SENIOR":
            booked_details = await book_sl_seniors(
              client,
              result_bookingdata,
              result_passengerdata,
              fare_details
            );
            break;
        }
        break;
      case "1A":
        break;
      case "2A":
        break;
      case "3A":
        break;
      case "CC":
        break;
      case "2S":
        break;
      case "EC":
        break;
      case "EA":
        break;
      case "E3":
        break;
      case "FC":
        break;
      default:
        throw {
          status: 400,
          success: false,
          message: `Booking not available for coach ${result_bookingdata.rows[0].coach_type} and reservation: ${result_bookingdata.rows[0].reservation_type}`,
          data: {},
        };
    }
    //6. proceed=true,
    result_bookingdata = await client.query(
      `update bookingdata set proceed_status=$1, booking_status = $2, payment_type=$3, amount_paid=$4, updated_amount=$5 where id=$6 returning *`,
      [
        true,
        booked_details.pnr_status,
        "card",
        total_fare,
        total_fare,
        result_bookingdata.rows[0].id,
      ]
    );
    //7. generate ticket
    result_ticketdata = await client.query(
      `insert into ticketdata (fkbookingdata, pnr_number, pnr_status, transactionid) values ($1,$2,$3,$4) returning *`,
      [
        result_bookingdata.rows[0].id,
        generatePNR(bookingid),
        booked_details.pnr_status,
        generatePNR(bookingid),
      ]
    );
    return {
      booking_details: result_bookingdata.rows[0],
      booked_details: booked_details.passenger_details,
      ticket_details: result_ticketdata.rows[0],
    };
  } catch (err) {
    throw err;
  }
};
module.exports = bookTicket;
