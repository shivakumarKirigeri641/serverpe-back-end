const axios = require("axios");
const allocateSeat_SL = require("../../utils/allocateSeat_SL");
require("dotenv").config();
const getPnrNumber = require("../../utils/getPnrNumber");
const book_sl = async (
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
    let type_code = result_details.rows[0].type_code.toUpperCase();
    type_code =
      (passengerdetails.rows[i].p_age >= 60 &&
        passengerdetails.rows[i].p_gender.toUpperCase() === "M") ||
      (passengerdetails.rows[i].p_age >= 50 &&
        passengerdetails.rows[i].p_gender.toUpperCase() === "F")
        ? "SENIOR"
        : result_details.rows[0].type_code.toUpperCase();
    switch (type_code) {
      case "TTL":
        if (0 < result_seats_availability.rows[0].ttl_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ttl_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set ttl_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ttl_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for tatkal!",
          };
        }
        break;
      case "PTL":
        if (0 < result_seats_availability.rows[0].ptl_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ptl_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set ptl_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ptl_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for seniors!",
          };
        }
        break;
      case "LADIES":
        if (0 < result_seats_availability.rows[0].ladies_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ladies_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set ladies_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ladies_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for ladies!",
          };
        }
        break;
      case "PWD":
        if (0 < result_seats_availability.rows[0].pwd_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].pwd_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set pwd_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].pwd_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for pwd!",
          };
        }
        break;
      case "DUTY":
        if (0 < result_seats_availability.rows[0].duty_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].duty_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set duty_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].duty_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for duty holders!",
          };
        }
        break;
      case "SENIOR":
        if (0 < result_seats_availability.rows[0].senior_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].senior_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
          await client.query(
            `update seatsondate_sl set senior_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].senior_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
        //waiting list
        else {
          throw {
            status: 200,
            success: false,
            message: "Booking not allowed for seniors!",
          };
        }
        break;
      case "GEN":
        if (0 < result_seats_availability.rows[0].gen_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].gen_count;
          const seat_details = allocateSeat_SL(
            "SL",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //decrement the count of gen_seats
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
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
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
          seat_allocation_status = "RAC";
          //decrement the count of rac_seats
          await client.query(
            `update seatsondate_sl set rac_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].rac_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //first get RAC_Count
          let raccount = 1;
          const result_fetchrac_count = await client.query(
            `select count(*) as count from seatallocation_sl where fk_seatsondate_sl=$1 and seat_status=$2`,
            [result_seats_availability.rows[0].id, "RAC"]
          );
          //insert into seat alloation
          raccount = raccount + Number(result_fetchrac_count.rows[0].count);
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_status, current_seat_status, updated_seat_status)values ($1,$2,$3,$4,$5) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
              "RAC",
              raccount,
              raccount,
            ]
          );
          //update the passengerdetails
          const temp = await client.query(
            `update passengerdata set seat_status=$1, current_seat_status=$2, updated_seat_status=$3 where id=$4 returning *`,
            ["RAC", raccount, raccount, passengerdetails.rows[i].id]
          );
          result_udpated_passengerdetails.push(temp.rows[0]);
        }
        //check if rac_share_count is present
        else if (0 < result_seats_availability.rows[0].rac_share_count) {
          seat_allocation_status = "RAC";
          //decrement the count of rac_seats
          await client.query(
            `update seatsondate_sl set rac_share_count = $1 where id=$2`,
            [
              --result_seats_availability.rows[0].rac_share_count,
              result_seats_availability.rows[0].id,
            ]
          );
          //first get RAC_Count
          let raccount = 1;
          const result_fetchrac_count = await client.query(
            `select count(*) as count from seatallocation_sl where fk_seatsondate_sl=$1 and seat_status=$2`,
            [result_seats_availability.rows[0].id, "RAC"]
          );
          //insert into seat alloation
          raccount = raccount + Number(result_fetchrac_count.rows[0].count);
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_status, current_seat_status, updated_seat_status)values ($1,$2,$3,$4,$5) returning *`,
            [
              passengerdetails.rows[i].id,
              result_seats_availability.rows[0].id,
              "RAC",
              raccount,
              raccount,
            ]
          );
          //update the passengerdetails
          const temp = await client.query(
            `update passengerdata set seat_status=$1, current_seat_status=$2, updated_seat_status=$3 where id=$4 returning *`,
            [
              "RAC",
              Number(result_fetchrac_count.rows[0].count),
              Number(result_fetchrac_count.rows[0].count),
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
            `select count(*) as count from seatallocation_sl where fk_seatsondate_sl=$1 and seat_status=$2`,
            [result_seats_availability.rows[0].id, "WTL"]
          );
          //insert into seat alloation
          wtlcount = wtlcount + Number(result_fetchrac_count.rows[0].count);
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_sl (fkpassengerdata, fk_seatsondate_sl, seat_status, current_seat_status, updated_seat_status)values ($1,$2,$3,$4,$5) returning *`,
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
module.exports = book_sl;
