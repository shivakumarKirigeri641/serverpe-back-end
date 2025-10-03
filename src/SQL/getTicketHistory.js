const getTicketHistory = async (client, mobile_number) => {
  const result = await client.query(
    `SELECT 
u.mobile_number,
j.train_number,
j.train_name,
j.source_code as passenger_source_code,
j.destination_code as passenger_destination_code,
j.source as passenger_source,
j.destination as passenger_destination,
tr.station_from as train_origin,
tr.station_to as train_destination,
s1.station_name as passenger_source,
s2.station_name as passenger_destination,
s1.departure as passenger_source_departure,
s2.arrival as passenger_destination_arrival,
j.totalamount,
j.paytype,
t.pnr,
t.pnrstatus


FROM public.ticketdata t
join journeyplandata j on j.id = t.fkjourneyplandata
join users u on u.id = j.fkuser
join trains tr on tr.train_number = j.train_number
join schedules s1 on s1.train_number = j.train_number
join schedules s2 on s2.train_number = j.train_number
where mobile_number = $1 and
s1.station_code = j.source_code and
s2.station_code = j.destination_code`,
    [mobile_number]
  );
  return result;
};
module.exports = getTicketHistory;
