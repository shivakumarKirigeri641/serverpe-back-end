const allocateSeat_SL = require("../../utils/allocateSeat_SL");
const { connectMockTrainTicketsDb } = require("../../database/connectDB");
const getPostgreClient = require("../getPostgreClient");
const allocateSeat_2A = require("../../utils/allocateSeat_2A");
const allocateSeat_3A = require("../../utils/allocateSeat_3A");
const prepareChart = async () => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    await client.query("BEGIN");
    //2A, 3A, SL
    const coach_type = ["2a", "3a", "sl"];
    //first convert all ract to allocate seats
    const result_trains_ready_to_depart_in_4hrs =
      await client.query(`WITH ist_now AS (
  SELECT (CURRENT_TIME AT TIME ZONE 'Asia/Kolkata')::time AS now_time
)
SELECT s.*
FROM schedules s, ist_now
WHERE 
  s.arrival IS NULL
  AND (
    (
      -- Case 1: simple case, same day
      s.departure BETWEEN 
        (ist_now.now_time + INTERVAL '3 hours 45 minutes')::time
        AND (ist_now.now_time + INTERVAL '4 hours 15 minutes')::time
    )
    OR
    (
      -- Case 2: wrap-around past midnight (e.g. 23:00 + 4h = 03:00)
      ist_now.now_time >= TIME '20:00'  -- meaning: current time after 8PM
      AND s.departure BETWEEN TIME '00:00' AND 
        ((ist_now.now_time + INTERVAL '4 hours 15 minutes') - INTERVAL '24 hours')::time
    )
  ) and s.train_number = '12308'
ORDER BY s.departure;`);
    //hardcode to test
    /*const result_trains_ready_to_depart_in_4hrs = await client.query(
      `SELECT train_number from schedules where train_number = '12308'`
    );*/
    for (
      let i = 0;
      i < result_trains_ready_to_depart_in_4hrs.rows.length;
      i++
    ) {
      for (let j = 0; j < coach_type.length; j++) {
        //get waiting list records
        let result_waiting_list_records = await client.query(
          `select sl.*, b.id, p.base_fare as bookingid from seatallocation_${coach_type[j]} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on b.id = p.fkbookingdata
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id`,
          [result_trains_ready_to_depart_in_4hrs.rows[i].train_number]
        );
        //first fetch rac having seat_numbers
        let result_rac_with_seatnumber = await client.query(
          `select sl.*, b.id as bookingid from seatallocation_${coach_type[j]} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on b.id = p.fkbookingdata
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' and sl.seat_sequence_number is not null order by sl.id`,
          [result_trains_ready_to_depart_in_4hrs.rows[i].train_number]
        );
        //fetch rac having null seat_numbers
        let result_rac_without_seatnumber = await client.query(
          `select sl.*, b.id  as bookingid from seatallocation_${coach_type[j]} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on b.id = p.fkbookingdata
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' and sl.seat_sequence_number is null  order by sl.id`,
          [result_trains_ready_to_depart_in_4hrs.rows[i].train_number]
        );
        if (
          0 < result_rac_with_seatnumber.rows.length &&
          0 < result_rac_without_seatnumber.rows.length &&
          result_rac_with_seatnumber.rows.length ===
            result_rac_without_seatnumber.rows.length
        ) {
          //loop and assign seats to them
          for (let k = 0; k < result_rac_with_seatnumber.rows.length; k++) {
            let seat_details = {};
            switch (coach_type[j]) {
              case "sl":
                seat_details = allocateSeat_SL(
                  "SL",
                  result_rac_with_seatnumber.rows[k].seat_sequence_number
                );
                break;
              case "2a":
                seat_details = allocateSeat_2A(
                  "2A",
                  result_rac_with_seatnumber.rows[k].seat_sequence_number
                );
                break;
              case "3a":
                seat_details = allocateSeat_3A(
                  "3A",
                  result_rac_with_seatnumber.rows[k].seat_sequence_number
                );
                break;
            }
            //first assign seat & seat_seq_number
            await client.query(
              `update seatallocation_${coach_type[j]} set seat_sequence_number = $1, seat_status=$2, updated_seat_status=$3, coach=$4, berth=$5, seat_number=$6 where
              fkpassengerdata = $7 or fkpassengerdata=$8`,
              [
                result_rac_with_seatnumber.rows[k].seat_sequence_number,
                "CNF",
                null,
                seat_details.coach_code,
                seat_details.berth_type,
                seat_details.seat_number,
                result_rac_with_seatnumber.rows[k].fkpassengerdata,
                result_rac_without_seatnumber.rows[k].fkpassengerdata,
              ]
            );
            //update passengerdata now
            await client.query(
              `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3 or id=$4`,
              [
                "CNF",
                seat_details.coach_code +
                  "/" +
                  seat_details.berth_type +
                  "/" +
                  seat_details.seat_number,
                result_rac_with_seatnumber.rows[k].fkpassengerdata,
                result_rac_without_seatnumber.rows[k].fkpassengerdata,
              ]
            );
            //update bookingdata now
            await client.query(
              `update bookingdata set pnr_status=$1 where id=$2 or id=$3`,
              [
                "CNF",
                result_rac_with_seatnumber.rows[k].bookingid,
                result_rac_without_seatnumber.rows[k].bookingid,
              ]
            );
            //after updating send SMS from here
          }
        }
        //insert into cancellation data and delete the waiting list records
        for (let l = 0; l < result_waiting_list_records.rows.length; l++) {
          await client.query(
            `insert into cancellationdata (fkpassengerdata, fkcancellation_charges_percent, cancellation_reason) values ($1,$2,$3)`,
            [
              result_waiting_list_records.rows[l].fkpassengerdata,
              1,
              "auto_cancel_for_waitinglist",
            ]
          );
          //update passengerdata
          //SEND SMS
          await client.query(
            `update passengerdata set updated_seat_status=$1, cancellation_status=$2, refund_amount =$3 where id=$4`,
            [
              null,
              true,
              result_waiting_list_records.rows[l].base_fare,
              result_waiting_list_records.row[l].fkpassengerdata,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    await client.release();
  }
};
module.exports = prepareChart;
