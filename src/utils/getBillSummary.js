const getBillSummary = (
  result_bookingChargesdata,
  adultcount,
  childcount,
  seniorcount,
  phcount
) => {
  return {
    total_base_fare:
      result_bookingChargesdata.rows[0].base_fare_per_adult * adultcount,
    total_child_concession:
      result_bookingChargesdata.rows[0].base_fare_per_adult * childcount -
      (result_bookingChargesdata.rows[0].base_fare_per_adult *
        childcount *
        result_bookingChargesdata.rows[0].percent_concession_child) /
        100,
    total_senior_concession:
      result_bookingChargesdata.rows[0].base_fare_per_adult * seniorcount -
      (result_bookingChargesdata.rows[0].base_fare_per_adult *
        seniorcount *
        result_bookingChargesdata.rows[0].percent_concession_senior) /
        100,
    total_physicallyhandicapped_concession:
      result_bookingChargesdata.rows[0].base_fare_per_adult * phcount -
      (result_bookingChargesdata.rows[0].base_fare_per_adult *
        phcount *
        result_bookingChargesdata.rows[0].percent_concession_senior) /
        100,
    GST_percent: result_bookingChargesdata.rows[0].GST,
    convience_percent: result_bookingChargesdata.rows[0].convience_percent,
    payment_integration_percent:
      result_bookingChargesdata.rows[0].payment_integration_percent,
    card_percent: result_bookingChargesdata.rows[0].card_percent,
    upi_percent: result_bookingChargesdata.rows[0].upi_percent,
    wallet_percent: result_bookingChargesdata.rows[0].wallet_percent,
  };
};
module.exports = getBillSummary;
