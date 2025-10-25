const axios = require("axios");
require("dotenv").config();
const getPnrNumber = require("../../utils/getPnrNumber");
const book_fc = async (
  client,
  result_details,
  passengerdetails,
  booking_id
) => {
  let result_updated_bookingdetails = {};
  let result_udpated_passengerdetails = [];
  let seat_allocation_status = "CNF";
  const result_bookingdata = await client.query(
    `select mobile_number from bookingdata where id=$1`,
    [booking_id]
  );
  const pnr = getPnrNumber(result_bookingdata.rows[0].mobile_number);
  //fetch scheduled departure
  const result_scheduled_departure = await client.query(
    `select departure from schedules where train_number=$1 and station_code = $2`,
    [result_details.rows[0].train_number, result_details.rows[0].source_code]
  );
  for (let i = 0; i < passengerdetails.rows.length; i++) {
    //lock
    let result_seats_availability = await client.query(
      `select *from seatsondate_fc where train_number=$1 and date_of_journey=$2 for update`,
      [
        result_details.rows[0].train_number,
        result_details.rows[0].date_of_journey,
      ]
    );
    //lock bookingdata
    let result_bookingdata = await client.query(
      `select *from bookingdata where id=$1 for update`,
      [booking_id]
    );

    switch (result_details.rows[0].type_code.toUpperCase()) {
      case "GEN":
        if (0 < result_seats_availability.rows[0].gen_count) {
          seat_allocation_status = "CNF";
          const seat_details = allocateSeat_fc(
            "fc",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_fc set gen_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].gen_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_fc (fkpassengerdata, fk_seatsondate_fc, seat_status)values ($1,$2,$3,$4) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
              "CNF",
            ]
          );
          //update the passengerdetails
          const temp = await client.query(
            `update passengerdata set seat_status=$1 where id=$2 returning *`,
            ["CNF", passengerdetails.rows[i].id]
          );
          result_udpated_passengerdetails.push(temp.rows[0]);
        }
        break;
    }
  }
  //update bookingid with pnr
  result_updated_bookingdetails = await client.query(
    `update bookingdata set pnr=$1, pnr_status=$2, proceed_status=$3 where id =$4 returning *`,
    [pnr, seat_allocation_status, true, booking_id]
  );
  //send sms
  /*const fast2smsResp = await axios.get(
    `https://www.fast2sms.com/dev/bulkV2?authorization=${
      process.env.FAST2SMSAPIKEY
    }&route=dlt&sender_id=NOQPNR&message=200941&variables_values=${pnr}|${
      result_details.rows[0].train_number +
      " (" +
      result_details.rows[0].source_code +
      " - " +
      result_details.rows[0].destination_code +
      ")"
    }|${
      result_details.rows[0].date_of_journey +
      ", " +
      result_scheduled_departure.rows[0].departure
    }&numbers=${result_details.rows[0].mobile_number}`
  );
  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    console.log(fast2smsResp.data);
  } else {
    // bubble details for debugging
    console.log(fast2smsResp.data);
  }*/
  return {
    result_updated_bookingdetails: result_updated_bookingdetails.rows[0],
    result_udpated_passengerdetails,
  };
};
module.exports = book_fc;
