const getBookingHistory = async (client, mobile_number) => {
  try {
    const result = await client.query(
      `SELECT 
    b.*, 
    t.train_number,
    p.p_name, p.p_gender, p.p_age, p.preferred_berth, p.seat_status,
    p.current_seat_status, p.updated_seat_status, p.is_child, p.is_senior,
    p.base_fare, p.cancellation_status, p.refund_amount,
    c.coach_code, 
    r.type_code,
    src.code AS source_code, src.station_name AS source_name,
    dest.code AS destination_code, dest.station_name AS destination_name,
    brding.code AS boarding_point, brding.station_name AS boarding_point_name
FROM bookingdata b
LEFT JOIN coaches t ON t.id = b.fktrain_number
LEFT JOIN coachtype c ON c.id = b.fkcoach_type
LEFT JOIN reservationtype r ON r.id = b.fkreservation_type
LEFT JOIN stations src ON src.id = b.fksource_code
LEFT JOIN stations dest ON dest.id = b.fkdestination_code
LEFT JOIN passengerdata p ON p.fkbookingdata = b.id
LEFT JOIN stations brding ON brding.id = b.fkboarding_at
WHERE b.mobile_number = $1
ORDER BY b.date_of_journey DESC;`,
      [mobile_number]
    );
    if (0 === result.rows.length) {
      return {
        status: 422,
        success: true,
        data: {},
        message: "No results found!",
      };
    } else {
      return {
        status: 200,
        success: true,
        data: result.rows,
        message: "Booking history fetched successfully!",
      };
    }
  } catch (err) {
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};
module.exports = getBookingHistory;
