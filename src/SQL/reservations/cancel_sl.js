const cancel_sl = async (client, passengerdata) => {
  let updated_passenger_data = null;
  try {
    //booking data
    let updated_passengerdata = null;
    switch (passengerdata.seat_status) {
      case "RAC":
        //you are cancelling a rac ticket
        break;
      case "WTL":
        //you are cancelling a waiting list ticket
        break;
      default:
        //you are cancelling a confirmed ticket
        //firsrt fetch 1st rac ticket
        let resutl_rac_tickets = await client.query(
          "select *from passengerdata where seat_status=$1 order by updated_seat_status asc",
          ["RAC"]
        );
        let resutl_wtl_tickets = await client.query(
          "select *from passengerdata where seat_status=$1 order by updated_seat_status asc",
          ["WTL"]
        );
        //update confirmed ticket to cancelled
        updated_passenger_data = await client.query(
          `update passengerdata set seat_status=$1 where id=$2`,
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
    return updated_passenger_data;
  } catch (err) {
    throw err;
  }
};
module.exports = cancel_sl;
