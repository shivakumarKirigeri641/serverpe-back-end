const axios = require("axios");
const allocateSeat_e3 = require("../../utils/allocateSeat_e3");
require("dotenv").config();
const getPnrNumber = require("../../utils/getPnrNumber");
const book_general_e3 = async (
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
      `select *from seatsondate_e3 where train_number=$1 and date_of_journey=$2 for update`,
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
    //adivicerylock (LETS SEE HOW IT WORKS THEN DO THIS)

    //check if gen_seats are there
    if (0 < result_seats_availability.rows[0].gen_count) {
      seat_allocation_status = "CNF";
      let current_gen_seat = result_seats_availability.rows[0].gen_count;
      const seat_details = allocateSeat_e3("E3", current_gen_seat);
      //decrement the count of gen_seats
      await client.query(
        `update seatsondate_e3 set gen_count = $1, total_seats=$2 where id=$3`,
        [
          --result_seats_availability.rows[0].gen_count,
          --result_seats_availability.rows[0].total_seats,
          result_seats_availability.rows[0].id,
        ]
      );
      //insert into seat alloation
      await client.query(
        `insert into seatallocation_e3 (fkpassengerdata, fk_seatsondate_e3, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
        [
          passengerdetails.rows[i].id,
          result_seats_availability.rows[0].id,
          current_gen_seat,
          "CNF",
          seat_details.coach_code,
          seat_details.seat_type,
          seat_details.seat_number,
        ]
      );
      //update the passengerdetails
      const temp = await client.query(
        `update passengerdata set seat_status=$1, current_seat_status=$2, updated_seat_status=$3 where id=$4 returning *`,
        [
          "CNF",
          seat_details.coach_code +
            "/" +
            seat_details.seat_number +
            "/" +
            seat_details.seat_type,
          seat_details.coach_code +
            "/" +
            seat_details.seat_number +
            "/" +
            seat_details.seat_type,
          passengerdetails.rows[i].id,
        ]
      );
      result_udpated_passengerdetails.push(temp.rows[0]);
    }
    //waiting list
    else {
      seat_allocation_status = "WTL";
      //first get RAC_Count
      let wtlcount = 1;
      const result_fetchrac_count = await client.query(
        `select count(*) as count from seatallocation_e3 where fk_seatsondate_e3=$1 and seat_status=$2`,
        [result_seats_availability.rows[0].id, "WTL"]
      );
      //insert into seat alloation
      wtlcount = wtlcount + Number(result_fetchrac_count.rows[0].count);
      //insert into seat alloation
      await client.query(
        `insert into seatallocation_e3 (fkpassengerdata, fk_seatsondate_e3, seat_status, current_seat_status, updated_seat_status)values ($1,$2,$3,$4,$5) returning *`,
        [
          passengerdetails.rows[i].id,
          result_seats_availability.rows[0].id,
          "WTL",
          wtlcount,
          wtlcount,
        ]
      );
      //update the passengerdetails
      const temp = await client.query(
        `update passengerdata set seat_status=$1, current_seat_status=$2, updated_seat_status=$3 where id=$4 returning *`,
        ["WTL", wtlcount, wtlcount, passengerdetails.rows[i].id]
      );
      result_udpated_passengerdetails.push(temp.rows[0]);
    }
  }
  //update bookingid with pnr
  result_updated_bookingdetails = await client.query(
    `update bookingdata set pnr=$1, pnr_status=$2, proceed_status=$3 where id =$4 returning *`,
    [pnr, seat_allocation_status, true, booking_id]
  );
  //send sms
  /*const faste3msResp = await axios.get(
    `https://www.faste3ms.com/dev/bulkV2?authorization=${
      process.env.FASTe3MSAPIKEY
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
  if (faste3msResp.data && faste3msResp.data.return) {
    //dont do anything
    console.log(faste3msResp.data);
  } else {
    // bubble details for debugging
    console.log(faste3msResp.data);
  }*/
  return {
    result_updated_bookingdetails: result_updated_bookingdetails.rows[0],
    result_udpated_passengerdetails,
  };
};
module.exports = book_general_e3;
