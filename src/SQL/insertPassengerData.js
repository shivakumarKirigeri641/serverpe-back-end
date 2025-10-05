const insertPassengerData = async (
  client,
  bookingdataid,
  passenger_details
) => {
  try {
    for (let i = 0; i < passenger_details.length; i++) {
      await client.query(
        `insert into passengerdata (fkbookingdata, p_name, p_age, p_gender, is_senior, is_physicallyhandicapped, is_child, preferred_berth) values
        ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
        [
          bookingdataid,
          passenger_details[i].passenger_name,
          passenger_details[i].passenger_age,
          passenger_details[i].passenger_gender,
          passenger_details[i].passenger_issenior ||
            passenger_details[i].passenger_age >= 60,
          passenger_details[i].passenger_isphysicallyhandicapped,
          passenger_details[i].passenger_ischild ||
            passenger_details[i].passenger_age <= 5,
          passenger_details[i].passenger_preferred_berth,
        ]
      );
    }
    return await client.query(
      "select *from passengerdata where fkbookingdata = $1",
      [bookingdataid]
    );
  } catch (err) {
    throw err;
  }
};
module.exports = insertPassengerData;
