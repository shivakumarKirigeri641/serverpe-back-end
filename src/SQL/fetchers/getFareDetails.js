const getFareDetails = async (
  client,
  booking_details,
  booked_information,
  passenger_details
) => {
  const result_distance = await client.query(
    `SELECT (s2.kilometer - s1.kilometer) as distance FROM public.schedules s1
join schedules s2 on s1.train_number = s2.train_number
where s1.train_number=$1 and s1.station_code = $2 and s2.station_code = $3 AND
s1.station_sequence < s2.station_sequence`,
    [
      booking_details.train_number,
      booking_details.source_code.toUpperCase(),
      booking_details.destination_code.toUpperCase(),
    ]
  );

  //first get individual fare
  let result_total_fare = await client.query(
    `select *from coachtype where coach_code=$1;`,
    [
      booking_details.coach_type
        ? booking_details.coach_type.toUpperCase()
        : booking_details.coach_code.toUpperCase(),
    ]
  );
  let additional_charges_details = await client.query(
    `select *from additionalcharges;`
  );

  let passengerdetails = [];
  //validate the booking concept!
  let total_fare = 0;
  for (let i = 0; i < passenger_details.length; i++) {
    await client.query(`select *from passengerdata where id=$1 for update`, [
      passenger_details[i].id,
    ]);
    switch (
      booking_details.reservation_type
        ? booking_details.reservation_type.toUpperCase()
        : booking_details.type_code.toUpperCase()
    ) {
      case "TTL":
        total_fare =
          total_fare +
          result_distance.rows[0].distance *
            result_total_fare.rows[0].fare_multiplier +
          result_total_fare.rows[0].tatkal_charge_adder;
        await client.query(
          `update passengerdata set base_fare = $1 where id=$2`,
          [
            result_distance.rows[0].distance *
              result_total_fare.rows[0].fare_multiplier +
              result_total_fare.rows[0].tatkal_charge_adder,
            passenger_details[i].id,
          ]
        );
        break;
      case "PTL":
        total_fare =
          total_fare +
          result_distance.rows[0].distance *
            result_total_fare.rows[0].fare_multiplier +
          result_total_fare.rows[0].premium_tatkal_charge_adder;
        await client.query(
          `update passengerdata set base_fare = $1 where id=$2`,
          [
            result_distance.rows[0].distance *
              result_total_fare.rows[0].fare_multiplier +
              result_total_fare.rows[0].premium_tatkal_charge_adder,
            passenger_details[i].id,
          ]
        );
        break;
      case "PWD":
      case "DUTY":
        total_fare =
          total_fare +
          result_distance.rows[0].distance *
            result_total_fare.rows[0].fare_multiplier *
            result_total_fare.rows[0].concession_pwd;
        await client.query(
          `update passengerdata set base_fare = $1 where id=$2`,
          [
            result_distance.rows[0].distance *
              result_total_fare.rows[0].fare_multiplier *
              result_total_fare.rows[0].concession_pwd,
            passenger_details[i].id,
          ]
        );
        break;
      default:
        total_fare = passenger_details[i].is_senior
          ? total_fare +
            result_distance.rows[0].distance *
              result_total_fare.rows[0].fare_multiplier *
              result_total_fare.rows[0].concession_senior
          : total_fare +
            result_distance.rows[0].distance *
              result_total_fare.rows[0].fare_multiplier;
        await client.query(
          `update passengerdata set base_fare = $1 where id=$2`,
          [
            passenger_details[i].is_senior
              ? result_distance.rows[0].distance *
                result_total_fare.rows[0].fare_multiplier *
                result_total_fare.rows[0].concession_senior
              : result_distance.rows[0].distance *
                result_total_fare.rows[0].fare_multiplier,
            passenger_details[i].id,
          ]
        );
        break;
    }
  }
  let gross_fare =
    total_fare + (total_fare * 18) / 100 + (total_fare * 1.3) / 100;
  return {
    base_fare: total_fare,
    GST: additional_charges_details.rows[0].percent_value,
    convience: additional_charges_details.rows[1].percent_value,
    gross_fare,
  };
};
module.exports = getFareDetails;
