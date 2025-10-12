const getCoachSeatAndBerth = require("../../../utils/getCoachSeatAndBerth");
const book_ec_ptl = async (
  client,
  result_bookingdata,
  result_passengerdata,
  fare_details
) => {
  let pnr_status = "CNF";
  let passenger_details = [];
  try {
    let result_seatsondate = await client.query(
      `select *from seatsondate where train_number=$1 and date_of_journey=$2 for update`,
      [
        result_bookingdata.rows[0].train_number,
        result_bookingdata.rows[0].date_of_journey,
      ]
    );
    let seatsondate_raccount = result_seatsondate.rows[0].seat_count_ec_rac;
    for (let i = 0; i < result_passengerdata.rows.length; i++) {
      let ptl_count = result_seatsondate.rows[0].seat_count_ec_ptl;
      //BOOK GENERAL TICKET IF AVAILABLE
      if (0 < result_seatsondate.rows[0].seat_count_ec_ptl) {
        let seat_details = getCoachSeatAndBerth(ptl_count, "ec");
        const temp = await client.query(
          `update passengerdata set seat_id=$1, seat_status=$2, message=$3, fkseatsondate=$4, current_seat_status=$5, updated_seat_status=$6, initial_seat_allocated=$7, individual_base_fare=$8 where id=$9 returning *`,
          [
            ptl_count,
            seat_details.coach +
              "/" +
              seat_details.seatPosition +
              "/" +
              seat_details.berthType,
            seat_details.message,
            result_seatsondate.rows[0].id,
            result_seatsondate.rows[0].id.pnr_status,
            result_seatsondate.rows[0].id.pnr_status,
            seat_details.coach +
              "/" +
              seat_details.seatPosition +
              "/" +
              seat_details.berthType,
            fare_details.total_base_fare,
            result_passengerdata.rows[i].id,
          ]
        );
        passenger_details.push(temp.rows[0]);
        ptl_count--;
        result_seatsondate = await client.query(
          `update seatsondate set seat_count_ec_ptl=$1 where id=$2 returning *`,
          [ptl_count, result_seatsondate.rows[0].id]
        );
      } else {
        throw {
          status: 400,
          success: false,
          message: `Booking not available for coach ${result_bookingdata.rows[0].coach_type}!`,
          data: {},
        };
      }
    }
    return { passenger_details, pnr_status };
  } catch (err) {
    throw err;
  }
};
module.exports = book_ec_ptl;
