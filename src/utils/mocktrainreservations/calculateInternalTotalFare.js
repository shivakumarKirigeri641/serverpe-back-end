function calculateInternalTotalFare({ journeyKm, fareRule, passengers }) {
  let totalFareBeforeGst = 0;

  for (const p of passengers) {
    // 🚼 Child below 6 → free
    if (p.age < 6) continue;

    let baseFare = journeyKm * fareRule.fare_per_km;

    // 🎯 Override discounts
    let discount = Number(fareRule.discount_percent) || 0;
    if (p.passenger_ispwd) discount = 50;
    else if (p.issenior) discount = 40;

    let discountedFare = baseFare - (baseFare * discount) / 100;

    let passengerFare = discountedFare + Number(fareRule.flat_addon);

    totalFareBeforeGst = totalFareBeforeGst + passengerFare;
  }

  // 💰 GST 18%
  const gst = Number((totalFareBeforeGst * 0.18).toFixed(2));
  const grandTotal = (totalFareBeforeGst + gst).toFixed(2);

  return {
    base_fare: +totalFareBeforeGst.toFixed(2),
    gst_18_percent: gst,
    total_fare: grandTotal,
    currency: "INR",
  };
}
module.exports = calculateInternalTotalFare;
