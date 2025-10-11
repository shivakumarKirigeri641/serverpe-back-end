const cancel_sl = require("./reservations/cancel_sl");
const cancelTicket = async (client, pnr, passengerids) => {
  let updated_ticket_data = null;
  let passenger_data = [];
  let result_bookingdata = null;
  let result_passengerdata = null;
  let cancelled_details = null;
  try {
    const result_ticketdata = await client.query(
      `select *from ticketdata where pnr_number = $1`,
      [pnr]
    );
    if (0 === result_ticketdata.rows.length) {
      throw {
        status: 400,
        success: false,
        message: `PNR/passenger information not found!`,
        data: {},
      };
    }
    for (let i = 0; i < passengerids.length; i++) {
      let passengerid = passengerids[i];
      result_passengerdata = await client.query(
        `select *from passengerdata where id = $1 and seat_status <> $2`,
        [passengerid, "CAN"]
      );
      console.log(result_passengerdata.rows[0]);
      if (0 === result_passengerdata.rows.length) {
        throw {
          status: 400,
          success: false,
          message: `PNR/passenger information not found!`,
          data: {},
        };
      }
      result_bookingdata = await client.query(
        `select *from bookingdata where id = $1`,
        [result_ticketdata.rows[0].fkbookingdata]
      );
      //first check if cancelling reservatiotype adn cocntype is?
      switch (result_bookingdata.rows[0].coach_type) {
        case "SL":
          let temp = await cancel_sl(
            client,
            result_passengerdata.rows[0],
            result_bookingdata.rows[0]
          );
          //update in bookingdata of cancellation charges;
          result_bookingdata = await client.query(
            "update bookingdata set updated_amount =$1 where id=$2 returning *",
            [
              temp.cancelled_details.cancellation_charges,
              result_bookingdata.rows[0].id,
            ]
          );
          passenger_data.push({
            passenger_details: temp.updated_passenger_data,
            cancelled_details: temp.cancelled_details,
          });
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
            message: `Invalid ticket information found`,
            data: {},
          };
      }
    }
    //if all tickets(passengers) cancelled, then pnr_status='can' for ticketdata
    updated_ticket_data = {
      booking_details: result_bookingdata.rows[0],
      passenger_details: passenger_data,
      ticket_details: result_ticketdata.rows[0],
    };
    return updated_ticket_data;
  } catch (err) {
    throw err;
  }
};
module.exports = cancelTicket;
