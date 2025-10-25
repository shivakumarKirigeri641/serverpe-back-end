const axios = require("axios");
const allocateSeat_ea = require("../../utils/allocateSeat_ea");
require("dotenv").config();
const getPnrNumber = require("../../utils/getPnrNumber");
const book_ea = async (
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
      `select *from seatsondate_ea where train_number=$1 and date_of_journey=$2 for update`,
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
      case "TTL":
        if (0 < result_seats_availability.rows[0].ttl_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ttl_count;
          const seat_details = allocateSeat_ea(
            "EA",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //dearement the count of gen_seats
          await client.query(
            `update seatsondate_ea set ttl_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ttl_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
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
          throw {
            status: 200,
            sueaess: false,
            message: "Booking not allowed for tatkal!",
          };
        }
        break;
      case "PTL":
        if (0 < result_seats_availability.rows[0].ptl_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ptl_count;
          const seat_details = allocateSeat_ea(
            "EA",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //dearement the count of gen_seats
          await client.query(
            `update seatsondate_ea set ptl_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ptl_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
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
          throw {
            status: 200,
            sueaess: false,
            message: "Booking not allowed for seniors!",
          };
        }
        break;
      case "LADIES":
        if (0 < result_seats_availability.rows[0].ladies_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].ladies_count;
          const seat_details = allocateSeat_ea(
            "EA",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //dearement the count of gen_seats
          await client.query(
            `update seatsondate_ea set ladies_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].ladies_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
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
          throw {
            status: 200,
            sueaess: false,
            message: "Booking not allowed for ladies!",
          };
        }
        break;
      case "SENIOR":
        if (0 < result_seats_availability.rows[0].senior_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].senior_count;
          const seat_details = allocateSeat_ea(
            "EA",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //dearement the count of gen_seats
          await client.query(
            `update seatsondate_ea set senior_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].senior_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
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
          throw {
            status: 200,
            sueaess: false,
            message: "Booking not allowed for seniors!",
          };
        }
        break;
      case "GEN":
        if (0 < result_seats_availability.rows[0].gen_count) {
          seat_allocation_status = "CNF";
          let current_gen_seat = result_seats_availability.rows[0].gen_count;
          const seat_details = allocateSeat_ea(
            "EA",
            current_gen_seat,
            result_details.rows[0].type_code?.toUpperCase()
          );
          //dearement the count of gen_seats
          await client.query(
            `update seatsondate_ea set gen_count = $1, total_seats=$2 where id=$3`,
            [
              --result_seats_availability.rows[0].gen_count,
              --result_seats_availability.rows[0].total_seats,
              result_seats_availability.rows[0].id,
            ]
          );
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_sequence_number, seat_status, coach, berth, seat_number)values ($1,$2,$3,$4,$5,$6,$7) returning *`,
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
            `select count(*) as count from seatallocation_ea where fk_seatsondate_ea=$1 and seat_status=$2`,
            [result_seats_availability.rows[0].id, "WTL"]
          );
          //insert into seat alloation
          wtlcount = wtlcount + Number(result_fetchrac_count.rows[0].count);
          //insert into seat alloation
          await client.query(
            `insert into seatallocation_ea (fkpassengerdata, fk_seatsondate_ea, seat_status, current_seat_status, updated_seat_status)values ($1,$2,$3,$4,$5) returning *`,
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
  /*const fasteamsResp = await axios.get(
    `https://www.fasteams.com/dev/bulkV2?authorization=${
      process.env.FASTeaMSAPIKEY
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
  if (fasteamsResp.data && fasteamsResp.data.return) {
    //dont do anything
    console.log(fasteamsResp.data);
  } else {
    // bubble details for debugging
    console.log(fasteamsResp.data);
  }*/
  return {
    result_updated_bookingdetails: result_updated_bookingdetails.rows[0],
    result_udpated_passengerdetails,
  };
};
module.exports = book_ea;
