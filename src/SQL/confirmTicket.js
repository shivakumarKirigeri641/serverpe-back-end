const { connectDB } = require("../database/connectDB");
const generatePNR = require("../utils/generatePNR");
const getPostgreClient = require("./getPostgreClient");
const confirmTicket = async (client, bookingid, total_fare) => {
  let result_bookingdata = [];
  let result_bookingcharges = [];
  let result_passengerdetails_updated = [];
  let result_ticket_pnr = [];
  try {
    let ticket_status = "CNF";
    //use 'ON UPDATE' in select query for locking row wise
    //then check coach_type
    //check reservation_type
    result_bookingdata = await client.query(
      "select *from bookingdata where id=$1",
      [bookingid]
    );
    result_bookingcharges = await client.query(
      "select *from bookingcharges where fkbookingdata=$1",
      [bookingid]
    );
    let result_passengerdetails = await client.query(
      "select *from passengerdata where fkbookingdata=$1",
      [bookingid]
    );
    //this is only to lock row
    await client.query(
      `SELECT *FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 for update`,
      [
        result_bookingdata.rows[0].date_of_journey,
        result_bookingdata.rows[0].train_number,
      ]
    );
    switch (result_bookingdata.rows[0].reservation_type) {
      case "GEN":
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
            //1. FIRST CHECK 'GEN/AVL' is present?, if not check if 'RAC/AVL' is present, if not then add at end to WTL<number>
            //if available, update passenger details to cnf, update seatsondate with AVL->CNF
            for (let i = 0; i < result_passengerdetails.rows.length; i++) {
              try {
                let result_sl_gen_avl = await client.query(
                  `SELECT coach_sl, regexp_count(coach_sl, 'GEN/AVL') AS gen_avl_per_coach FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2`,
                  [
                    result_bookingdata.rows[0].date_of_journey,
                    result_bookingdata.rows[0].train_number,
                  ]
                );
                if (0 < result_sl_gen_avl.rows[0].gen_avl_per_coach) {
                  //book confirmed ticket
                  const result_seat_confirm = await client.query(
                    `WITH changed AS (SELECT id, substring(coach_sl from '@([^@]*GEN/AVL[^@]*)@') AS old_block FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 AND coach_sl LIKE '%GEN/AVL%' LIMIT 1 )UPDATE seatsondate s SET coach_sl = regexp_replace(s.coach_sl, 'GEN/AVL', 'GEN/CNF', 1) FROM changed c WHERE s.id = c.id RETURNING regexp_replace(c.old_block, 'GEN/AVL', 'GEN/CNF') AS updated_substring;`,
                    [
                      result_bookingdata.rows[0].date_of_journey,
                      result_bookingdata.rows[0].train_number,
                    ]
                  );
                  await client.query(
                    `SELECT coach_sl, regexp_count(coach_sl, 'GEN/AVL') AS gen_avl_per_coach FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2`,
                    [
                      result_bookingdata.rows[0].date_of_journey,
                      result_bookingdata.rows[0].train_number,
                    ]
                  );
                  //UPDATE THE PASS table
                  const temp = await client.query(
                    "update passengerdata set seat_status=$1 where id=$2 returning *",
                    [
                      result_seat_confirm.rows[0].updated_substring,
                      result_passengerdetails.rows[i].id,
                    ]
                  );
                  result_passengerdetails_updated.push(temp.rows[0]);
                } else {
                  //firc check for total count of RAC from coach_sl
                  const result_total_rac_count = await client.query(
                    "select seat_rac from coach_sl where train_number = $1",
                    [result_bookingdata.rows[0].train_number]
                  );
                  //then check how many rac are booked in seatsondate.
                  const result_confirmed_rac = await client.query(
                    `SELECT COALESCE(SUM( (LENGTH(coach_sl) - LENGTH(REPLACE(coach_sl, 'RAC/CNF', ''))) / LENGTH('RAC/CNF') ), 0) AS rac_cnf_count FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 AND coach_sl LIKE $3`,
                    [
                      result_bookingdata.rows[0].date_of_journey,
                      result_bookingdata.rows[0].train_number,
                      "%RAC/CNF%",
                    ]
                  );
                  //if count < twice of rac count, then book rac, otherwise waitinglist
                  if (
                    result_confirmed_rac.rows[0].rac_cnf_count <
                    2 * result_total_rac_count.rows[0].seat_rac
                  ) {
                    ticket_status = "RAC";
                    //book RAC ticket
                    const result_seat_confirm = await client.query(
                      `WITH changed AS (SELECT id, substring(coach_sl from '@([^@]*RAC/AVL[^@]*)@') AS old_block FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 AND coach_sl LIKE '%RAC/AVL%' LIMIT 1 )
                      UPDATE seatsondate s SET coach_sl = regexp_replace(s.coach_sl, 'RAC/AVL', 'RAC/CNF', 1) FROM changed c WHERE s.id = c.id RETURNING regexp_replace(c.old_block, 'RAC/AVL', 'RAC/CNF') AS updated_substring;`,
                      [
                        result_bookingdata.rows[0].date_of_journey,
                        result_bookingdata.rows[0].train_number,
                      ]
                    );
                    await client.query(
                      `SELECT coach_sl, regexp_count(coach_sl, 'RAC/AVL') AS RAC_avl_per_coach FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2`,
                      [
                        result_bookingdata.rows[0].date_of_journey,
                        result_bookingdata.rows[0].train_number,
                      ]
                    );
                    //UPDATE THE PASS table
                    console.log(result_confirmed_rac.rows[0].rac_cnf_count);
                    const temp = await client.query(
                      "update passengerdata set seat_status=$1 where id=$2 returning *",
                      [
                        "RAC" +
                          Number(result_confirmed_rac.rows[0].rac_cnf_count++),
                        result_passengerdetails.rows[i].id,
                      ]
                    );
                    temp.rows[0].seat_status =
                      "RAC" +
                      Number(result_confirmed_rac.rows[0].rac_cnf_count++);
                    result_passengerdetails_updated.push(temp.rows[0]);
                  } else {
                    ticket_status = "WTL";
                    console.log("inside");
                    //book RAC ticket
                    const result_wtl_count = await client.query(
                      `SELECT train_number, date_of_journey, regexp_count(coach_sl, 'WTL[0-9]+') AS wtl_count FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2`,
                      [
                        result_bookingdata.rows[0].date_of_journey,
                        result_bookingdata.rows[0].train_number,
                      ]
                    );
                    await client.query(
                      `UPDATE seatsondate SET coach_sl = coach_sl || '/' || $3 WHERE train_number = $1 AND date_of_journey = $2 RETURNING coach_sl;`,
                      [
                        result_bookingdata.rows[0].train_number,
                        result_bookingdata.rows[0].date_of_journey,
                        "WTL" + result_wtl_count.rows[0].wtl_count++,
                      ]
                    );
                    //UPDATE THE PASS table
                    const temp = await client.query(
                      "update passengerdata set seat_status=$1 where id=$2 returning *",
                      [
                        result_wtl_count.rows[0].wtl_count + 1,
                        result_passengerdetails.rows[i].id,
                      ]
                    );
                    temp.rows[0].seat_status =
                      "WTL" + result_wtl_count.rows[0].wtl_count++;
                    result_passengerdetails_updated.push(temp.rows[0]);
                  }
                }
              } catch (err) {}
            }
            //confirm the ticket
            result_ticket_pnr = await client.query(
              `insert into ticketdata (fkbookingdata, fkbookingcharges, pnr_number, pnr_status, transactionid) values ($1,$2,$3,$4, $5) returning *`,
              [
                result_bookingdata.rows[0].id,
                result_bookingcharges.rows[0].id,
                generatePNR(result_bookingcharges.rows[0].id),
                ticket_status,
                generatePNR(result_bookingdata.rows[0].id),
              ]
            );
            //now update bookingdata proceed_status to 'true'
            result_bookingdata = await client.query(
              "update bookingdata set proceed_status=$1 where id=$2 returning *",
              [true, result_bookingdata.rows[0].id]
            );
            result_bookingcharges = await client.query(
              "update bookingcharges set pay_status=$1, total_fare_paid=$2 where id=$3 returning *",
              [1, total_fare, result_bookingcharges.rows[0].id]
            );
            //GET BACK THE CONNECTION
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
    return {
      bookingdata: result_bookingdata.rows[0],
      bookingcharges: result_bookingcharges.rows[0],
      passengerdetails: result_passengerdetails_updated,
      ticket: result_ticket_pnr.rows[0],
    };
  } catch (err) {
    throw err;
  }
};
module.exports = confirmTicket;
