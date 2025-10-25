const getFareDetails = require("../fetchers/getFareDetails");
const insertbookingdata_ea = async (client, booking_details) => {
  let booked_details = null;
  let passenger_details = [];
  let search_details = {};
  try {
    //check if coach given is applicable for selected train?
    const result_coach_check = await client.query(
      `select ea from coaches where train_number = $1`,
      [booking_details.train_number]
    );

    if (0 < result_coach_check.rows.length) {
      if ("N" === result_coach_check.rows[0].ea.toUpperCase()) {
        throw {
          status: 200,
          suecess: false,
          message: "Coach not applicable for selected train!",
        };
      }
    } else {
      throw {
        status: 200,
        suecess: false,
        message: "Invalid coach found!",
      };
    }
    let adult_count = booking_details.passenger_details.filter(
      (x) => x.passenger_ischild === false || x.passenger_issenior === true
    );
    let child_count = booking_details.passenger_details.filter(
      (x) => x.passenger_ischild === true
    );
    //lock advicery loack
    await client.query(
      `SELECT hashtext(mobile_number) FROM bookingdata WHERE mobile_number = $1`,
      [booking_details.mobile_number]
    );
    //first check if user is already logged in but no booked (like check trains->again go back & modify src,dest date etc)
    const result_is_already_user = await client.query(
      `select *from bookingdata where mobile_number = $1 and proceed_status=$2`,
      [booking_details.mobile_number, false]
    );
    if (0 === result_is_already_user.rows.length) {
      booked_details = await client.query(
        `insert into bookingdata (fktrain_number, date_of_journey, fksource_code, fkdestination_code, fkreservation_type, fkcoach_type, mobile_number, adult_count, child_count, fkboarding_at) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *`,
        [
          result_train_number.rows[0].id,
          booking_details.doj,
          result_src.rows[0].id,
          result_dest.rows[0].id,
          result_reservation_type.rows[0].id,
          result_coach_type.rows[0].id,
          booking_details.mobile_number,
          adult_count.length,
          child_count.length,
          result_brdingat.rows[0].id,
        ]
      );
      //insert passenger list
      for (let i = 0; i < booking_details.passenger_details.length; i++) {
        const temp = await client.query(
          `insert into passengerdata (fkbookingdata,p_name, p_age, p_gender, preferred_berth, is_child, is_senior, is_adult) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
          [
            booked_details.rows[0].id,
            booking_details.passenger_details[i].passenger_name,
            booking_details.passenger_details[i].passenger_age,
            booking_details.passenger_details[i].passenger_gender,
            booking_details.passenger_details[i].preferred_berth
              ? booking_details.passenger_details[i].preferred_berth
              : null,
            booking_details.passenger_details[i].passenger_age < 6
              ? true
              : false,
            booking_details.passenger_details[
              i
            ].passenger_gender.toUpperCase() === "F"
              ? booking_details.passenger_details[i].passenger_age > 50
                ? true
                : false
              : booking_details.passenger_details[i].passenger_age > 60
              ? true
              : false,
            !(booking_details.passenger_details[
              i
            ].passenger_gender.toUpperCase() === "F"
              ? booking_details.passenger_details[i].passenger_age > 50
                ? true
                : false
              : booking_details.passenger_details[i].passenger_age > 60
              ? true
              : false),
          ]
        );
        passenger_details.push(temp.rows[0]);
      }
      //now get fare deatils:
      const fare_details = await getFareDetails(
        client,
        booking_details,
        booked_details,
        passenger_details
      );
      return {
        booked_details: booked_details.rows[0],
        passenger_details: passenger_details,
        fare_details: fare_details,
      };
    } else {
      //update coach
      await client.query(
        `update bookingdata set fktrain_number=$1, fksource_code=$2, fkdestination_code=$3, fkboarding_at=$4, fkcoach_type=$5, mobile_number=$6, adult_count=$7, child_count=$8 where id=$9`,
        [
          result_train_number.rows[0].id,
          result_src.rows[0].id,
          result_dest.rows[0].id,
          result_brdingat.rows[0].id,
          result_coach_type.rows[0].id,
          booking_details.mobile_number,
          adult_count.length,
          child_count.length,
          result_is_already_user.rows[0].id,
        ]
      );
      //insert passenger list
      await client.query(`delete from passengerdata where fkbookingdata = $1`, [
        result_is_already_user.rows[0].id,
      ]);
      for (let i = 0; i < booking_details.passenger_details.length; i++) {
        const temp = await client.query(
          `insert into passengerdata (fkbookingdata,p_name, p_age, p_gender, preferred_berth, is_child, is_senior, is_adult) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
          [
            result_is_already_user.rows[0].id,
            booking_details.passenger_details[i].passenger_name,
            booking_details.passenger_details[i].passenger_age,
            booking_details.passenger_details[i].passenger_gender,
            booking_details.passenger_details[i].preferred_berth
              ? booking_details.passenger_details[i].preferred_berth
              : null,
            booking_details.passenger_details[i].passenger_age < 6
              ? true
              : false,
            booking_details.passenger_details[
              i
            ].passenger_gender.toUpperCase() === "F"
              ? booking_details.passenger_details[i].passenger_age > 50
                ? true
                : false
              : booking_details.passenger_details[i].passenger_age > 60
              ? true
              : false,
            !(booking_details.passenger_details[
              i
            ].passenger_gender.toUpperCase() === "F"
              ? booking_details.passenger_details[i].passenger_age > 50
                ? true
                : false
              : booking_details.passenger_details[i].passenger_age > 60
              ? true
              : false),
          ]
        );
        passenger_details.push(temp.rows[0]);
      }
      //now get fare deatils:
      const fare_details = await getFareDetails(
        client,
        booking_details,
        booked_details,
        passenger_details
      );
      return {
        booked_details: result_is_already_user.rows[0],
        passenger_details: passenger_details,
        fare_details: fare_details,
      };
    }
  } catch (err) {
    throw err;
  }
};
module.exports = insertbookingdata_ea;
