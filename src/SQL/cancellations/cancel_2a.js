const cancel_2a = async (client, passengerdata, bookingdata) => {
  let updated_passenger_data = null;
  let resutl_wtl_tickets = null;
  try {
    //booking data
    let updated_passengerdata = null;
    let cancelled_details = null;
    //get hours differnece from departure
    const result_diff_hours = await client.query(
      `SELECT EXTRACT(EPOCH FROM ((CURRENT_DATE + departure) - (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'))) / 3600 AS hours_difference FROM schedules  where train_number = $1 and station_code=$2`,
      [bookingdata.train_number, bookingdata.source_code]
    );
    switch (passengerdata.seat_status) {
      case "RAC":
        //you are cancelling a rac ticket
        //firsrt fetch 1st wtl ticket
        resutl_wtl_tickets = await client.query(
          "select *from passengerdata where seat_status=$1 order by updated_seat_status asc for udpate",
          ["WTL"]
        );
        //cancel the ticket now
        //update confirmed ticket to cancelled
        updated_passenger_data = await client.query(
          `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3 returning *`,
          ["CAN", null, passengerdata.id]
        );

        //update ONE of the watlst to up AND REST WITH PUSING UPDATING SEQ TO UP
        await client.query(
          `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3`,
          ["RAC", resutl_rac_tickets.rows.length, resutl_wtl_tickets.rows[0].id]
        );
        //update rest of the racs
        for (let j = 1; j < resutl_rac_tickets.rows.length; j++) {
          await client.query(
            `update passengerdata set updated_seat_status=$1 where id=$2`,
            [j, resutl_rac_tickets.rows[j].id]
          );
        }

        for (let j = 1; j < resutl_wtl_tickets.rows.length; j++) {
          await client.query(
            `update passengerdata set updated_seat_status=$1 where id=$2`,
            [j, resutl_wtl_tickets.rows[j].id]
          );
        }
        break;
      case "WTL":
        //you are cancelling a waiting list ticket
        updated_passenger_data = await client.query(
          `update passengerdata set seat_status=$1, updated_seat_status=$2  where id=$3 returning *`,
          ["CAN", null, passengerdata.id]
        );
        //the numbers below this ticket must be pushed to up
        for (
          let j = passengerdata.updatd_seat_status + 1;
          j < resutl_wtl_tickets.rows.length;
          j++
        ) {
          await client.query(
            `update passengerdata set updated_seat_status=$1 where id=$2`,
            [j, resutl_wtl_tickets.rows[j].id]
          );
        }
        break;
      default:
        //you are cancelling a confirmed ticket
        //firsrt fetch 1st rac ticket
        let resutl_rac_tickets = await client.query(
          "select *from passengerdata where seat_status=$1 order by updated_seat_status asc  for udpate",
          ["RAC"]
        );
        resutl_wtl_tickets = await client.query(
          "select *from passengerdata where seat_status=$1 order by updated_seat_status asc for udpate",
          ["WTL"]
        );
        //update confirmed ticket to cancelled
        updated_passenger_data = await client.query(
          `update passengerdata set seat_status=$1 where id=$2 returning *`,
          ["CAN", passengerdata.id]
        );
        if (0 < resutl_rac_tickets.rows.length) {
          //update ONE of the rac with PUSING UPDATING SEQ TO UP
          updated_passengerdata = await client.query(
            `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3 returning *`,
            ["CNF", null, resutl_rac_tickets.rows[0].id]
          );
          //update ONE of the watlst to up AND REST WITH PUSING UPDATING SEQ TO UP
          await client.query(
            `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3`,
            [
              "RAC",
              resutl_rac_tickets.rows.length,
              resutl_wtl_tickets.rows[0].id,
            ]
          );

          //update rest of the racs
          for (let j = 1; j < resutl_rac_tickets.rows.length; j++) {
            await client.query(
              `update passengerdata set updated_seat_status=$1 where id=$2`,
              [j, resutl_rac_tickets.rows[j].id]
            );
          }

          for (let j = 1; j < resutl_wtl_tickets.rows.length; j++) {
            await client.query(
              `update passengerdata set updated_seat_status=$1 where id=$2`,
              [j, resutl_wtl_tickets.rows[j].id]
            );
          }
        } else {
          console.log("waiting list w/o rac possible????");
        }
        break;
    }
    //insert into cancel deatils
    const result_cancellation_policy = await client.query(
      `select *from cancellationpolicy`
    );
    let cancellation_charges =
      bookingdata.reservation_type.toString() === "TTL" ||
      bookingdata.reservation_type.toString() === "PTL"
        ? passengerdata.individual_base_fare
        : passengerdata.seat_status.toString() === "WTL"
        ? 0
        : passengerdata.individual_base_fare -
          passengerdata.individual_base_fare *
            (result_diff_hours.rows[0].hours_difference < 4
              ? result_cancellation_policy.rows[0].cancel_4 / 100
              : result_diff_hours.rows[0].hours_difference > 4 &&
                result_diff_hours.rows[0].hours_difference < 8
              ? result_cancellation_policy.rows[0].cancel_4_8 / 100
              : result_diff_hours.rows[0].hours_difference > 8 &&
                result_diff_hours.rows[0].hours_difference < 12
              ? result_cancellation_policy.rows[0].cancel_8_12 / 100
              : result_cancellation_policy.rows[0].cancel_12 / 100);
    cancelled_details = await client.query(
      `insert into cancellationdata (fkpassengerdata, cancellation_charges) values ($1,$2) returning *`,
      [passengerdata.id, cancellation_charges]
    );
    return {
      updated_passenger_data: updated_passenger_data.rows[0],
      cancelled_details: cancelled_details.rows[0],
    };
  } catch (err) {
    throw err;
  }
};
module.exports = cancel_2a;
