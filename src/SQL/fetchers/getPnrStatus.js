const getPnrStatus = async (client, pnr) => {
  let result_pnr = await client.query(
    `select count(*) as pnr_count from bookingdata where pnr= $1`,
    pnr
  );
  if (0 === result_pnr.rows.length) {
    throw {
      status: 422,
      success: false,
      message: "PNR details not found!",
    };
  }
  result_pnr = await client.query(
    `select b.id, p.id, c.train_number, sr.code AS source_code, dest.code as destination_code, ct.coach_code, 
r.type_code, b.date_of_journey, b.mobile_number, p.p_name, p.p_gender, p.p_age, p.is_senior, p.is_child, 
p.base_fare, p.refund_amount, p.current_seat_status, p.updated_seat_status, p.cancellation_status

from bookingdata b join
reservationtype r on r.id=b.fkreservation_type
join stations sr on sr.id = b.fksource_code
join passengerdata p on p.fkbookingdata = b.id
join stations brding on brding.id = b.fkboarding_at
join stations dest on dest.id = b.fkdestination_code
join coaches c on c.id = b.fktrain_number
join coachtype ct on ct.id = b.fkcoach_type where b.pnr= $1`,
    [pnr]
  );
  if (0 === result_pnr.rows.length) {
    throw {
      status: 502,
      success: false,
      message: "Something went wrong.",
    };
  } else {
    return result_pnr.rows[0];
  }
};
module.exports = getPnrStatus;
