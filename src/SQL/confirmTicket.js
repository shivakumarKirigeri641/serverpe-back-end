const { connectDB } = require("../database/connectDB");
const generatePNR = require("../utils/generatePNR");
const getPostgreClient = require("./getPostgreClient");
const confirmTicket = async (client, bookingid, total_fare) => {
  const resullt_ticketdetails = null;
  try {
    let ticket_status = "CNF";
    let result_ticket_pnr = {};
    //use 'ON UPDATE' in select query for locking row wise
    //then check coach_type
    //check reservation_type
    let result_bookingdata = await client.query(
      "select *from bookingdata where id=$1",
      [bookingid]
    );
    const result_bookingcharges = await client.query(
      "select *from bookingcharges where fkbookingdata=$1",
      [bookingid]
    );
    console.log(result_bookingcharges.rows[0]);
    let result_passengerdetails_updated = [];
    let result_passengerdetails = await client.query(
      "select *from passengerdata where fkbookingdata=$1",
      [bookingid]
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
                await client.query("BEGIN");
                let result_sl_gen_avl = await client.query(
                  `SELECT coach_sl, regexp_count(coach_sl, 'GEN/AVL') AS gen_avl_per_coach FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 for update`,
                  [
                    result_bookingdata.rows[0].date_of_journey,
                    result_bookingdata.rows[0].train_number,
                  ]
                );
                if (0 < result_sl_gen_avl.rows[0].gen_avl_per_coach) {
                  //book confirmed ticket
                  const result_seat_confirm = await client.query(
                    `UPDATE seatsondate SET coach_sl = regexp_replace(coach_sl, 'GEN/AVL', 'GEN/CNF', 1) WHERE date_of_journey = $1 AND train_number = $2 AND coach_sl LIKE '%GEN/AVL%' RETURNING  regexp_replace((regexp_match(coach_sl, '@([^@]*GEN/CNF[^@]*)@'))[1], '@', '', 'g') AS updated_substring;`,
                    [
                      result_bookingdata.rows[0].date_of_journey,
                      result_bookingdata.rows[0].train_number,
                    ]
                  );
                  await client.query(
                    `SELECT coach_sl, regexp_count(coach_sl, 'GEN/AVL') AS gen_avl_per_coach FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 for update`,
                    [
                      result_bookingdata.rows[0].date_of_journey,
                      result_bookingdata.rows[0].train_number,
                    ]
                  );
                  console.log(
                    "seat:",
                    result_seat_confirm.rows[0].updated_substring
                  );
                  //UPDATE THE PASS table
                  result_passengerdetails_updated.push(
                    await client.query(
                      "update passengerdata set seat_status=$1 where id=$2 returning *",
                      [
                        result_seat_confirm.rows[0].updated_substring,
                        result_passengerdetails.rows[i].id,
                      ]
                    )
                  );
                  //confirm ticket but dont show seat allocation
                } else {
                  //firc check for total count of RAC from coach_sl
                  const result_total_rac_count = await client.query(
                    "select seat_rac from coach_sl where train_number = $1",
                    [result_bookingdata.rows[0].train_number]
                  );
                  //then check how many rac are booked in seatsondate.
                  const result_confirmed_rac = await client.query(
                    `SELECT  SUM( (LENGTH(coach_sl) - LENGTH(REPLACE(coach_sl, 'RAC/CNF', ''))) / LENGTH('RAC/CNF') ) AS rac_cnf_count FROM seatsondate WHERE date_of_journey = $1 AND train_number = $2 AND coach_sl LIKE $3;`,
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
                    //2* because 2 pass can sit in one seat
                    //confirm RAC ticket but dont show seat allocation
                  } else {
                    ticket_status = "WTL";
                    //make it waiting list,
                    //first get how many WTL are present, then append this substring to it
                  }
                }
                await client.query("COMMIT");
              } catch (err) {
                client.query("ROLLBACK");
              }
            }
            //confirm the ticket
            result_ticket_pnr = await client.query(
              `insert into ticketdata (fkbookingdata, fkbookingcharges, pnr_number, pnr_status) values ($1,$2,$3,$4)`,
              [
                result_bookingdata.rows[0].id,
                result_bookingcharges.rows[0].id,
                generatePNR(result_bookingcharges.rows[0].id),
                ticket_status,
              ]
            );
            //now update bookingdata proceed_status to 'true'
            result_bookingdata = await client.query(
              "update bookingdata set proceed_status=$1 where id=$2",
              [result_bookingdata.rows[0].id, true]
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
    await client.query("BEGIN");
    return {
      result_bookingdata,
      result_bookingcharges,
      result_passengerdetails_updated,
      result_ticket_pnr,
    };
  } catch (err) {
    throw err;
  }
};
module.exports = confirmTicket;
