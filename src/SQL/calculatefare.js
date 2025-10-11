const calculatefare = async (
  client,
  bookingdata,
  passengerdetails,
  adultcount,
  childcount
) => {
  let sum = 0;
  try {
    const result_schedule = await client.query(
      `select (s2.kilometer - s1.kilometer) as distance from schedules s1 join
schedules s2 on s1.train_number = s2.train_number where
s1.station_sequence < s2.station_sequence and 
s1.train_number = $1 and
s1.station_code = $2 and
s2.station_code = $3`,
      [
        bookingdata.train_number,
        bookingdata.source_code.toUpperCase(),
        bookingdata.destination_code.toUpperCase(),
      ]
    );
    const result_seatsondate = await client.query(
      `select *from seatsondate where train_number = $1 and date_of_journey=$2`,
      [bookingdata.train_number, bookingdata.date_of_journey]
    );
    switch (bookingdata.coach_type) {
      case "SL":
        switch (bookingdata.reservation_type) {
          case "GEN":
            sum =
              adultcount *
              result_seatsondate.rows[0].seat_price_sl_gen *
              result_schedule.rows[0].distance;
            sum = Math.ceil(sum);
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
    return {
      ID: result_seatsondate.rows[0].id,
      total_base_fare: sum,
      total_adults: bookingdata.adult_count,
      total_child: bookingdata.child_count,
      convience_fee_percent:
        result_seatsondate.rows[0].convience_charge_percent,
      GST: result_seatsondate.rows[0].gst_percent,
      card_charges_percent: result_seatsondate.rows[0].card_charge_percent,
    };
  } catch (err) {
    throw err;
  }
};
module.exports = calculatefare;
