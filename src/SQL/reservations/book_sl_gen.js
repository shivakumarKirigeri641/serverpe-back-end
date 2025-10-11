const getCoachSeatAndBerth = require("../../utils/getCoachSeatAndBerth");
const book_sl_gen = async (
  client,
  result_bookingdata,
  result_passengerdata
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
    let seatsondate_raccount = result_seatsondate.rows[0].seat_count_sl_rac;
    for (let i = 0; i < result_passengerdata.rows.length; i++) {
      let gen_count = result_seatsondate.rows[0].seat_count_sl_gen;
      let rac_count = result_seatsondate.rows[0].seat_count_sl_rac;

      //BOOK GENERAL TICKET IF AVAILABLE
      if (0 < result_seatsondate.rows[0].seat_count_sl_gen) {
        let seat_details = getCoachSeatAndBerth(gen_count, "SL");
        const temp = await client.query(
          `update passengerdata set seat_id=$1, seat_status=$2, message=$3, fkseatsondate=$4, updated_seat_status=$5 where id=$6 returning *`,
          [
            gen_count,
            seat_details.coach +
              "/" +
              seat_details.seatPosition +
              "/" +
              seat_details.berthType,
            seat_details.message,
            result_seatsondate.rows[0].id,
            pnr_status,
            result_passengerdata.rows[i].id,
          ]
        );
        passenger_details.push(temp.rows[0]);
        gen_count--;
        result_seatsondate = await client.query(
          `update seatsondate set seat_count_sl_gen=$1 where id=$2 returning *`,
          [gen_count, result_seatsondate.rows[0].id]
        );
        //gen
      }
      //BOOK RAC
      else if (0 < result_seatsondate.rows[0].seat_count_sl_rac) {
        pnr_status = "RAC";
        //first take how many RAC are present in passenger_data for selected train, date, coach_type, reservation_type
        const result_rac_count_check = await client.query(
          `select COUNT(p.updated_seat_status) as rac_count from passengerdata p join bookingdata b on p.fkbookingdata = b.id where b.train_number = $1 
          and b.coach_type =$2 and b.reservation_type=$3 and b.date_of_journey = $4 and p.updated_seat_status ilike $5`,
          [
            result_bookingdata.rows[0].train_number,
            result_bookingdata.rows[0].coach_type,
            result_bookingdata.rows[0].reservation_type,
            result_bookingdata.rows[0].date_of_journey,
            "%RAC%",
          ]
        );
        //reduce rac count from seatsondate
        let rac_count = Number(result_rac_count_check.rows[0].rac_count) + 1;
        const temp = await client.query(
          `update passengerdata set seat_id=$1, seat_status=$2, message=$3, fkseatsondate=$4, updated_seat_status=$5 where id=$6 returning *`,
          [
            rac_count,
            pnr_status + rac_count,
            "Final seat status will be available after chart preparation",
            result_seatsondate.rows[0].id,
            pnr_status + rac_count,
            result_passengerdata.rows[i].id,
          ]
        );
        passenger_details.push(temp.rows[0]);
        seatsondate_raccount--;
        result_seatsondate = await client.query(
          `update seatsondate set seat_count_sl_rac=$1 where id=$2 returning *`,
          [seatsondate_raccount, result_seatsondate.rows[0].id]
        );
        rac_count++;
        //rac
      } else {
        //waiting list
        pnr_status = "WTL";
      }
    }
    console.log({ passenger_details, pnr_status });
    return { passenger_details, pnr_status };
  } catch (err) {
    throw err;
  }
};
module.exports = book_sl_gen;
