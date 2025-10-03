const getStationDetails = require("./getStationDetails");
const generatePNR = require("../utils/generatePNR");
const jwt = require("jsonwebtoken");
const insertJourneyData = async (client, req) => {
  let ticketdata = null;
  const { token } = req.cookies;
  const bookingData = req.body;
  const result_token = await jwt.verify(token, process.env.SECRET_KEY);
  await client.query("BEGIN");
  const result_user = await client.query(
    "select *from users where mobile_number = $1",
    [result_token.mobile_number]
  );
  const result_sourcedetails = await getStationDetails(
    client,
    bookingData.src.toUpperCase()
  );
  const result_destinationdetails = await getStationDetails(
    client,
    bookingData.dest.toUpperCase()
  );
  const result_train_and_journey_details = await client.query(
    `SELECT t.train_number, t.train_name, t.station_from as train_origin, 
t.station_to as train_destination, s1.station_name as passenger_source,
s2.station_name as passenger_destination, s1.arrival as source_arrival, s1.departure as passenger_departure,
s2.arrival as destination_arrival, s2.kilometer, ceil(s2.kilometer*0.31) as base_fare,
s1.running_day as start_day, s2.running_day as destination_day
FROM public.trains t
join schedules s1 on t.train_number = s1.train_number 
join schedules s2 on t.train_number = s2.train_number
where t.train_number = $1 and
s1.station_code = $2 and
s2.station_code = $3 and
s1.station_sequence < s2.station_sequence`,
    [
      bookingData.train_number,
      bookingData.src.toUpperCase(),
      bookingData.dest.toUpperCase(),
    ]
  );
  const now = new Date();
  const doj = new Date();
  if (1 < result_train_and_journey_details.rows[0].start_day) {
    doj = doj.setDate(doj.getDate() + 1);
  }
  let base_fare =
    false === bookingData.physicallyhandicaped
      ? result_train_and_journey_details.rows[0].base_fare *
          bookingData.adults +
        result_train_and_journey_details.rows[0].base_fare *
          bookingData.children *
          0.5
      : result_train_and_journey_details.rows[0].base_fare * 0.4;
  //1.3% of payment chrges & 1.8% integratino charges
  let total_fare =
    base_fare + (1.3 * base_fare) / 100 + base_fare + (1.8 * base_fare) / 100;
  const result_journeydata = await client.query(
    `insert into journeyplandata (fkuser, source_code, destination_code, source, destination, train_number, train_name, dateofjourney, adults, 
      children,isphysicallyhandicapped, totalamount, paytype) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *`,
    [
      result_user.rows[0].id,
      result_sourcedetails.rows[0].code,
      result_destinationdetails.rows[0].code,
      result_train_and_journey_details.rows[0].passenger_source,
      result_train_and_journey_details.rows[0].passenger_destination,
      result_train_and_journey_details.rows[0].train_number,
      result_train_and_journey_details.rows[0].train_name,
      doj,
      bookingData.adults,
      bookingData.children,
      bookingData.physicallyhandicaped === true ? true : false,
      total_fare,
      bookingData.paytype,
    ]
  );
  const dateandtimeofconfirm = new Date().toISOString();
  ticketdata = await client.query(
    `insert into ticketdata (fkjourneyplandata, pnr, datenadtimeofconfirmation, pnrstatus, departure, transactionid) values (
        $1,$2,$3,$4,($5::time),$6) returning *`,
    [
      result_journeydata.rows[0].id,
      generatePNR(),
      dateandtimeofconfirm,
      0,
      result_train_and_journey_details.rows[0].passenger_departure,
      generatePNR(), //gen transactionid again by calling pnr for timebeing
    ]
  );
  await client.query("COMMIT");
  return {
    train_details: {
      train_number: result_train_and_journey_details.rows[0].train_number,
      train_name: result_train_and_journey_details.rows[0].train_name,
      train_origin: result_train_and_journey_details.rows[0].train_origin,
      train_destination:
        result_train_and_journey_details.rows[0].train_destination,
      kilometer: result_train_and_journey_details.rows[0].kilometer,
    },
    passenger_details: {
      passenger_source:
        result_train_and_journey_details.rows[0].passenger_source,
      passenger_destination:
        result_train_and_journey_details.rows[0].passenger_destination,
      adults: bookingData.adults,
      children: bookingData.children,
      isphysicallyhandicapped: bookingData.physicallyhandicaped,
      total_fare: result_train_and_journey_details.rows[0].base_fare,
      passenger_departure:
        result_train_and_journey_details.rows[0].passenger_departure,
      passenger_destination_arrival:
        result_train_and_journey_details.rows[0].destination_arrival,
      passenger_source_arrival:
        result_train_and_journey_details.rows[0].source_arrival,
    },
    booked_details: bookingData,
    ticket_details: {
      pnr: ticketdata.rows[0].pnr,
      pnr_status: ticketdata.rows[0].pnrstatus,
    },
  };
};
module.exports = insertJourneyData;
