const getCoachSeatAndBerth = require("../utils/getCoachSeatAndBerth");
const generatePNR = require("../utils/generatePNR");
const calculatefare = require("../SQL/calculatefare");
const bookTicket = async (client, bookingid) => {
  let pnr_status = "CNF";
  let result_bookingdata = await client.query(
    "select *from bookingdata where id=$1",
    [bookingid]
  );
  result_passengerdata = await client.query(
    "select *from passengerdata where fkbookingdata=$1",
    [bookingid]
  );
  let passenger_details = [];
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
    console.log(fare_details);
    let total_fare =
      fare_details.total_base_fare +
      (fare_details.total_base_fare * fare_details.convience_fee_percent) /
        100 +
      (fare_details.total_base_fare * fare_details.GST) / 100 +
      (fare_details.total_base_fare * fare_details.card_charges_percent) / 100;
    //1. fetch booking data & passenger data
    switch (result_bookingdata.rows[0].coach_type) {
      case "SL":
        switch (result_bookingdata.rows[0].reservation_type) {
          case "GEN":
            //2. lock the seatsondate row
            //3. decrment count
            //4. assign to passenger & loop for count
            //5. pass that number to get berth/coach/seat
            //first check if seats available,
            //if yes, assign id and decrment, and assign to passenger
            //if no, check if RAC is present, and assign to passenger but just stats
            //if rac is not there, add to waiting list table
            let result_seatsondate = await client.query(
              `select *from seatsondate where train_number=$1 and date_of_journey=$2 for update`,
              [
                result_bookingdata.rows[0].train_number,
                result_bookingdata.rows[0].date_of_journey,
              ]
            );
            for (let i = 0; i < result_passengerdata.rows.length; i++) {
              let gen_count = result_seatsondate.rows[0].seat_count_sl_gen;
              let rac_count = result_seatsondate.rows[0].seat_count_sl_rac;
              if (0 < result_seatsondate.rows[0].seat_count_sl_gen) {
                let seat_details = getCoachSeatAndBerth(gen_count, "SL");
                const temp = await client.query(
                  `update passengerdata set seat_id=$1, seat_status=$2, message=$3, fkseatsondate=$4 where id=$5 returning *`,
                  [
                    gen_count,
                    seat_details.coach +
                      "/" +
                      seat_details.seatPosition +
                      "/" +
                      seat_details.berthType,
                    seat_details.message,
                    result_seatsondate.rows[0].id,
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
              } else if (0 < result_seatsondate.rows[0].seat_count_sl_gen) {
                pnr_status = "RAC";
                //rac
              } else {
                //waiting list
                pnr_status = "WTL";
              }
            }
            break;
          case "TTL":
            break;
          case "PTL":
            break;
          case "LADIES":
            break;
          case "SENIOR":
            break;
          case "PWD":
            break;
          case "DUTY":
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
    }
    //6. proceed=true,
    result_bookingdata = await client.query(
      `update bookingdata set proceed_status=$1, booking_status = $2, payment_type=$3, amount_paid=$4 where id=$5 returning *`,
      [true, pnr_status, "card", total_fare, result_bookingdata.rows[0].id]
    );
    //7. generate ticket
    result_ticketdata = await client.query(
      `insert into ticketdata (fkbookingdata, pnr_number, pnr_status, transactionid) values ($1,$2,$3,$4) returning *`,
      [
        result_bookingdata.rows[0].id,
        generatePNR(bookingid),
        pnr_status,
        generatePNR(bookingid),
      ]
    );
    return {
      booking_details: result_bookingdata.rows[0],
      passenger_details,
      ticket_details: result_ticketdata.rows[0],
    };
  } catch (err) {
    throw err;
  }
};
module.exports = bookTicket;
