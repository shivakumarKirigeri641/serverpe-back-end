const fillCancelledSeats = async (
  client,
  passengerids,
  train_number,
  table_suffix
) => {
  table_suffix = table_suffix.toLowerCase();

  //this gives confirmed ticket who all are cancelled.
  let result_confirmed_ticket_cancelled = await client.query(
    `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.seat_status_copy, sl.coach, sl.seat_number, sl.berth from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status_copy= 'CNF' AND sl.seat_status='CAN' and sl.fkpassengerdata =ANY($2) ORDER BY sl.id for update`,
    [train_number, passengerids]
  );
  //this gives rac ticket who all are cancelled.888
  let result_rac_ticket_cancelled = await client.query(
    `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.seat_status_copy from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status_copy= 'RAC' AND sl.seat_status='CAN' and sl.fkpassengerdata =ANY($2) ORDER BY sl.id for update`,
    [train_number, passengerids]
  );
  //this gives WTL ticket who all are cancelled.
  let result_wtl_ticket_cancelled = await client.query(
    `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.seat_status_copy from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status_copy= 'WTL' AND sl.seat_status='CAN' and sl.fkpassengerdata =ANY($2) ORDER BY sl.id for update`,
    [train_number, passengerids]
  );
  //assign cancelled seat to them,
  //then reduce waiting list

  if (0 < result_confirmed_ticket_cancelled.rows.length) {
    //first confirm the RAC ticket
    let result_rac_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_sl sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' order by sl.id;`,
      [train_number]
    );
    //check if wtl is present but not rac
    let result_wtl_instead_of_rac_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_sl sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id;`,
      [train_number]
    );
    //first confirm the rac ticket
    if (0 < result_rac_details.rows.length) {
      for (let i = 0; i < result_confirmed_ticket_cancelled.rows.length; i++) {
        //confirm
        await client.query(
          `update seatallocation_${table_suffix} set fkpassengerdata = $1 where fkpassengerdata = $2`,
          [
            result_rac_details.rows[i].fkpassengerdata,
            result_confirmed_ticket_cancelled.rows[i].fkpassengerdata,
          ]
        );
        //delete that rac entries
        await client.query(
          `delete from seatallocation_${table_suffix} where id = $1`,
          [result_rac_details.rows[i].id]
        );
        //update passengerdata
        await client.query(
          `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3`,
          [
            "CNF",
            result_confirmed_ticket_cancelled.rows[i].coach +
              "/" +
              result_confirmed_ticket_cancelled.rows[i].seat_number +
              "/" +
              result_confirmed_ticket_cancelled.rows[i].berth,
            result_rac_details.rows[i].fkpassengerdata,
          ]
        );
      }
      //update the remaining status
      //fetch 1st occurances of wtl
      let result_first_wtl_records = await client.query(
        `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id asc limit $2;`,
        [train_number, result_confirmed_ticket_cancelled.rows.length]
      );
      for (let i = 0; i < result_first_wtl_records.rows.length; i++) {
        await client.query(
          `update seatallocation_${table_suffix} set seat_status=$1 where fkpassengerdata = $2`,
          ["RAC", result_first_wtl_records.rows[i].fkpassengerdata]
        );
      }

      //now again update sequence number in updated_seat_status(rac)
      result_rac_details = await client.query(
        `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' order by sl.id;`,
        [train_number]
      );
      for (let i = 0; i < result_rac_details.rows.length; i++) {
        await client.query(
          `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
          [i + 1, result_rac_details.rows[i].fkpassengerdata]
        );
      }
      //now again update sequence number in updated_seat_status wtl
      let result_wtl_details = await client.query(
        `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id;`,
        [train_number]
      );
      for (let i = 0; i < result_wtl_details.rows.length; i++) {
        await client.query(
          `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
          [i + 1, result_wtl_details.rows[i].fkpassengerdata]
        );
      }
    }
    //like 2s, ec, ea, rather then rac, we have waiting list
    else {
      for (let i = 0; i < result_confirmed_ticket_cancelled.rows.length; i++) {
        //confirm
        //if no waiting list
        if (0 < result_wtl_instead_of_rac_details.rows.length) {
          await client.query(
            `update seatallocation_${table_suffix} set fkpassengerdata = $1 where fkpassengerdata = $2`,
            [
              result_wtl_instead_of_rac_details.rows[i].fkpassengerdata,
              result_confirmed_ticket_cancelled.rows[i].fkpassengerdata,
            ]
          );
        }
        //delete that rac entries
        if (0 < result_wtl_instead_of_rac_details.rows.length) {
          await client.query(
            `delete from seatallocation_${table_suffix} where id = $1`,
            [result_wtl_instead_of_rac_details.rows[i].id]
          );
          //update passengerdata
          await client.query(
            `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3`,
            [
              "CNF",
              result_confirmed_ticket_cancelled.rows[i].coach +
                "/" +
                result_confirmed_ticket_cancelled.rows[i].seat_number +
                "/" +
                result_confirmed_ticket_cancelled.rows[i].berth,
              result_wtl_instead_of_rac_details.rows[i].fkpassengerdata,
            ]
          );
        }
      }
      //now again update sequence number in updated_seat_status wtl
      let result_wtl_details = await client.query(
        `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id;`,
        [train_number]
      );
      for (let i = 0; i < result_wtl_details.rows.length; i++) {
        await client.query(
          `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
          [i + 1, result_wtl_details.rows[i].fkpassengerdata]
        );
      }
    }
  }
  if (0 < result_rac_ticket_cancelled.rows.length) {
    //first delete rac seat
    for (let i = 0; i < result_rac_ticket_cancelled.rows.length; i++) {
      await client.query(
        `delete from seatallocation_${table_suffix} where fkpassengerdata=$1`,
        [result_rac_ticket_cancelled.rows[i].fkpassengerdata]
      );
    }
    //seq for rac
    //now again update sequence number in updated_seat_status(rac)
    let result_rac_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' order by sl.id;`,
      [train_number]
    );
    for (let i = 0; i < result_rac_details.rows.length; i++) {
      await client.query(
        `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
        [i + 1, result_rac_details.rows[i].fkpassengerdata]
      );
    }
    //fetch 1st occurances of wtl
    let result_first_wtl_records = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id asc limit $2;`,
      [train_number, result_confirmed_ticket_cancelled.rows.length]
    );
    for (let i = 0; i < result_first_wtl_records.rows.length; i++) {
      let temp = await client.query(
        `update seatallocation_${table_suffix} set seat_status=$1 where fkpassengerdata = $2 returning *`,
        ["RAC", result_first_wtl_records.rows[i].fkpassengerdata]
      );
      //update passengerdata
      await client.query(
        `update passengerdata set seat_status=$1, updated_seat_status=$2 where id=$3`,
        [
          "RAC",
          temp.rows[0].updated_seat_status,
          result_first_wtl_records.rows[i].fkpassengerdata,
        ]
      );
    }
    //update passenger
    //now again update sequence number in updated_seat_status(rac)
    result_rac_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='RAC' order by sl.id;`,
      [train_number]
    );
    for (let i = 0; i < result_rac_details.rows.length; i++) {
      await client.query(
        `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
        [i + 1, result_rac_details.rows[i].fkpassengerdata]
      );
    }
    //now again update sequence number in updated_seat_status wtl
    let result_wtl_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id;`,
      [train_number]
    );
    for (let i = 0; i < result_wtl_details.rows.length; i++) {
      await client.query(
        `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
        [i + 1, result_wtl_details.rows[i].fkpassengerdata]
      );
    }
  }
  if (0 < result_wtl_ticket_cancelled.rows.length) {
    //directly delete
    for (let i = 0; i < result_wtl_ticket_cancelled.rows.length; i++) {
      await client.query(
        `delete from seatallocation_${table_suffix} where fkpassengerdata=$1`,
        [result_wtl_ticket_cancelled.rows[i].fkpassengerdata]
      );
    }
    //now again update sequence number in updated_seat_status wtl
    let result_wtl_details = await client.query(
      `select sl.id, sl.fkpassengerdata, sl.seat_status, sl.current_seat_status, sl.updated_seat_status from seatallocation_${table_suffix} sl
join passengerdata p on p.id = sl.fkpassengerdata
join bookingdata b on p.fkbookingdata = b.id
join coaches c on c.id = b.fktrain_number
where c.train_number = $1 and sl.seat_status='WTL' order by sl.id;`,
      [train_number]
    );
    for (let i = 0; i < result_wtl_details.rows.length; i++) {
      await client.query(
        `update seatallocation_${table_suffix} set updated_seat_status=$1 where fkpassengerdata=$2`,
        [i + 1, result_wtl_details.rows[i].fkpassengerdata]
      );
    }
  }
};
module.exports = fillCancelledSeats;
