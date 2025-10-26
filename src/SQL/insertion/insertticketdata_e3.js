const book_e3 = require("../reservations/book_e3");
const insertticketdata_e3 = async (client, booking_id) => {
  let confirm_details = {};
  const result_details = await client.query(
    `select b.id, c.train_number, sr.code AS source_code, dest.code as destination_code, ct.coach_code, r.type_code, b.date_of_journey, b.mobile_number from bookingdata b join
reservationtype r on r.id=b.fkreservation_type
join stations sr on sr.id = b.fksource_code
join stations brding on brding.id = b.fkboarding_at
join stations dest on dest.id = b.fkdestination_code
join coaches c on c.id = b.fktrain_number
join coachtype ct on ct.id = b.fkcoach_type where b.id= $1 for update`,
    [booking_id]
  );
  const passengerdetails = await client.query(
    `select *from passengerdata where fkbookingdata = $1 order by id asc`,
    [booking_id]
  );
  if (0 === passengerdetails.rows.length) {
    throw {
      status: 200,
      sue3ess: false,
      message: "Passenger details not found!",
    };
  }

  //reserve seats
  switch (result_details.rows[0].type_code.toUpperCase()) {
    case "TTL":
    case "PTL":
    case "LADIES":
    case "SENIOR":
    case "GEN":
      switch (result_details.rows[0].coach_code.toUpperCase()) {
        default: //e3
          confirm_details = await book_e3(
            client,
            result_details,
            passengerdetails,
            booking_id
          );
          break;
      }
      break;
    default:
      throw {
        status: 200,
        sue3ess: false,
        message: "Booking not allowed for selected reservation type!",
      };
  }
  return confirm_details;
};
module.exports = insertticketdata_e3;
