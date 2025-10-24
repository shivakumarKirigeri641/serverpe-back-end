const allocateSeat_SL = require("../../utils/allocateSeat_SL");
const getPnrNumber = require("../../utils/getPnrNumber");
const book_general_sl = async (
  client,
  result_details,
  passengerdetails,
  booking_id
) => {
  let result_updated_bookingdetails = {};
  let result_udpated_passengerdetails = [];
  let seat_allocation_status = "CNF";
  const pnr = getPnrNumber(booking_id);
  for (let i = 0; i < passengerdetails.rows.length; i++) {
    //lock
    console.log(result_details.rows[0].date_of_journey);
    let result_seats_availability = await client.query(
      `select *from seatsondate_sl where train_number=$1 and date_of_journey=$2 for update`,
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
      const seat_details = allocateSeat_SL("SL", current_gen_seat);
      await client.query(
        `update seatsondate_sl set gen_count = $1, total_seats=$2 where id=$3`,
        [
          --result_seats_availability.rows[0].gen_count,
          --result_seats_availability.rows[0].total_seats,
          result_seats_availability.rows[0].id,
        ]
      );
      //insert into seat alloation
      await client.query(
        `insert into seatallocation_sl (fkpassengerdata, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6) returning *`,
        [
          passengerdetails.rows[i].id,
          current_gen_seat,
          "CNF",
          seat_details.coach_code,
          seat_details.berth_type,
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
            seat_details.berth_type,
          seat_details.coach_code +
            "/" +
            seat_details.seat_number +
            "/" +
            seat_details.berth_type,
          passengerdetails.rows[i].id,
        ]
      );
      result_udpated_passengerdetails.push(temp.rows[0]);
    }
    //check if rac
    else if (0 < result_seats_availability.rows[0].rac_count) {
    }
    //check if rac_share
    else if (0 < result_seats_availability.rows[0].rac_share_count) {
    }
    //waiting list
    else {
      //direct insert in seatallocation_sl
    }
  }
  //update bookingid with pnr
  result_updated_bookingdetails = await client.query(
    `update bookingdata set pnr=$1, pnr_status=$2, proceed_status=$3 where id =$4 returning *`,
    [pnr, seat_allocation_status, true, booking_id]
  );
  return {
    result_updated_bookingdetails: result_updated_bookingdetails.rows[0],
    result_udpated_passengerdetails,
  };
};
module.exports = book_general_sl;
