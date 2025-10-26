const checkSeats = async (
  client,
  train_number,
  date_of_journey,
  coach_type,
  reservation_type
) => {
  let table_suffix = "SL";
  let status = true;
  switch (coach_type.toUpperCase()) {
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
    default:
      throw {
        status: 422,
        message: `Booking not allowed!`,
        data: {},
      };
      break;
  }
  //check
  //allow if 'gen' is present
  let result = [];
  if ("gen" !== reservation_type) {
    const result = await client.query(
      `select ${reservation_type.toLowerCase()}_count as seat_count from seatsondate_${coach_type.toLowerCase()} where train_number=$1 and date_of_journey=$2`,
      [train_number, date_of_journey]
    );
    if (0 == result.rows.length) {
      status = false;
    } else {
      if (!result.rows[0].seat_count || 0 === result.rows[0].seat_count) {
        status = false;
      }
    }
  }
  return status;
};
module.exports = checkSeats;
