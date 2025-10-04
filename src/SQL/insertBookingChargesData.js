const insertBookingChargesData = async (
  client,
  bookingdataid,
  train_number,
  src,
  dest,
  reservation_type,
  coach_type,
  passenger_details
) => {
  let result = null;
  try {
    const result_srckm = await client.query(
      "select kilometer from schedules where train_number= $1 and station_code = $2",
      [train_number, src.toUpperCase()]
    );
    const result_destkm = await client.query(
      "select kilometer from schedules where train_number= $1 and station_code = $2",
      [train_number, dest.toUpperCase()]
    );
    const km = result_destkm.rows[0].kilometer - result_srckm.rows[0].kilometer;
    console.log(
      "km:",
      result_destkm.rows[0].kilometer - result_srckm.rows[0].kilometer
    );
    const price_info = await client.query("select *from pricelist");
    let base_fare = 0;
    switch (coach_type) {
      case "1A":
        base_fare = km * price_info.rows[0].price_1a;
        break;
      case "2A":
        base_fare = km * price_info.rows[0].price_2a;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 300;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 400;
        }
        break;
      case "3A":
        base_fare = km * price_info.rows[0].price_3a;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 300;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 400;
        }
        break;
      case "CC":
        base_fare = km * price_info.rows[0].price_cc;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
      case "EC":
        base_fare = km * price_info.rows[0].price_ec;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
      case "EA":
        base_fare = km * price_info.rows[0].price_ea;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
      case "E3":
        base_fare = km * price_info.rows[0].price_e3;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
      case "FC":
        base_fare = km * price_info.rows[0].price_fc;
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
      default:
        base_fare = km * price_info.rows[0].price_sl;
        if ("TTL" === reservation_type) {
          base_fare = base_fare + 100;
        } else if ("PTL" === reservation_type) {
          base_fare = base_fare + 200;
        }
        break;
    }
    result = await client.query(
      "insert into bookingcharges (fkbookingdata, base_fare_per_adult) values ($1,$2) returning *",
      [bookingdataid, base_fare]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
module.exports = insertBookingChargesData;
