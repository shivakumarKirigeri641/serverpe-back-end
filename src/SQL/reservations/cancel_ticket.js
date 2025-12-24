const getHoursUntilDeparture = require("../../utils/getHoursUntilDeparture");
const fillCancelledSeats = require("../reservations/fillCancelledSeats");
const getpercentValueForCancellation = require("../../utils/getpercentValueForCancellation");
const cancel_ticket = async (client, pnr, passengerids) => {
  let table_suffix = "sl";
  try {
    await client.query(`BEGIN`);
    const result_cancellation_policy = await client.query(
      `select id, from_time, to_time, percent_charges from cancellationpolicy order by id`
    );
    const result_booking_details = await client.query(
      `select b.id, c.train_number, sr.code AS source_code, b.pnr_status, dest.code as destination_code, ct.coach_code, r.type_code, b.date_of_journey, b.mobile_number from bookingdata b join
reservationtype r on r.id=b.fkreservation_type
join stations sr on sr.id = b.fksource_code
join passengerdata p on p.fkbookingdata = b.id
join stations brding on brding.id = b.fkboarding_at
join stations dest on dest.id = b.fkdestination_code
join coaches c on c.id = b.fktrain_number
join coachtype ct on ct.id = b.fkcoach_type where b.pnr= $1 for update`,
      [pnr]
    );
    if (0 === result_booking_details.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Passenger details not found for pnr ${pnr}`,
      };
    }
    //check if passengerids are valie
    const result_passengers = await client.query(
      `SELECT * FROM passengerdata WHERE id = ANY($1)`,
      [passengerids]
    );
    if (result_passengers.rows.length != passengerids.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Passenger details invalid for pnr ${pnr}`,
      };
    }
    //get departure time:
    const result_departure_time = await client.query(
      `select departure from schedules where train_number=$1 and station_code = $2`,
      [
        result_booking_details.rows[0].train_number,
        result_booking_details.rows[0].source_code,
      ]
    );
    if (0 === result_departure_time.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Invalid train information found on fetching departure!`,
      };
    }

    const hours_remaining_for_departure = getHoursUntilDeparture(
      result_booking_details.rows[0].date_of_journey,
      result_departure_time.rows[0].departure
    );
    const result_cancellation_policy_details = getpercentValueForCancellation(
      hours_remaining_for_departure,
      result_cancellation_policy
    );
    for (let i = 0; i < passengerids.length; i++) {
      let fkcancellation = 1;
      let cancellation_message = "self";
      let refund_amount_percent = 1;
      table_suffix = result_booking_details.rows[0].coach_code.toLowerCase();
      let result_passenger_details = await client.query(
        `select *from passengerdata where id=$1 for update`,
        [passengerids[i]]
      );
      switch (result_booking_details.rows[0].coach_code.toUpperCase()) {
        //lock
        case "SL":
          table_suffix = "sl";
          break;
        case "3A":
          table_suffix = "3a";
          break;
        case "2A":
          table_suffix = "2a";
          break;
        case "1A":
          table_suffix = "1a";
          break;
        case "2S":
          table_suffix = "2s";
          break;
        case "CC":
          table_suffix = "cc";
          break;
        case "EC":
          table_suffix = "ec";
          break;
        case "E3":
          table_suffix = "e3";
          break;
        case "EA":
          table_suffix = "ea";
          break;
        case "FC":
          table_suffix = "fc";
          break;
      }
      switch (result_booking_details.rows[0].type_code.toUpperCase()) {
        case "TTL": //NO REFUND
        case "PTL": //NO REFUND
          fkcancellation = 1;
          refund_amount_percent = 1;
          cancellation_message = "self";
          break;
        default: //other quota
          fkcancellation = result_cancellation_policy_details.id;
          refund_amount_percent =
            result_cancellation_policy_details.percentvalue;
          break;
      }
      //lock
      await client.query(
        `select *from seatallocation_${table_suffix} where fkpassengerdata = $1 for update`,
        [passengerids[i]]
      );
      await client.query(
        `update seatallocation_${table_suffix} set seat_status=$1 Where fkpassengerdata=$2`,
        ["CAN", passengerids[i]]
      );
      //insert into cancellationdata
      await client.query(
        `insert into cancellationdata (fkpassengerdata, fkcancellation_charges_percent, cancellation_reason) values ($1,$2,$3) returning *`,
        [
          passengerids[i],
          result_cancellation_policy_details.id,
          cancellation_message,
        ]
      );
      //update passengerdata
      await client.query(
        //how will you get amount paid for passenger?
        `update passengerdata set seat_status=$1, updated_seat_status=$2, refund_amount=$3, cancellation_status=$4 where id=$5 returning *`,
        [
          "CAN",
          null,
          result_passenger_details.rows[0].base_fare -
            result_passenger_details.rows[0].base_fare * refund_amount_percent,
          true,
          passengerids[i],
        ]
      );
    }
    //now update the alloation of seats to rest of them
    //update bookingdat to CAN if all passengers are cancelled
    if (result_passengers.rows.length === passengerids.length) {
      await client.query(`update bookingdata set pnr_status=$1 where id=$2`, [
        "CAN",
        result_booking_details.rows[0].id,
      ]);
      result_booking_details.rows[0].pnr_status = "CAN";
    }
    //now fetch updated one and return the data
    const passenger_details = await client.query(
      `select *from passengerdata where fkbookingdata=$1 order by id`,
      [result_booking_details.rows[0].id]
    );
    //fill canclled seats to others
    await fillCancelledSeats(
      client,
      passengerids,
      result_booking_details.rows[0].train_number,
      table_suffix
    );
    await client.query(`COMMIT`);
    return {
      result_bookingdata: result_booking_details.rows[0],
      passenger_details: passenger_details.rows,
    };
  } catch (err) {
    await client.query(`ROLLBACK`);
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};

module.exports = cancel_ticket;
