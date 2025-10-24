const getPnrNumber = (bookingDataId) => {
  if (!bookingDataId) {
    throw new Error("Either mobileNumber or bookingDataId must be provided");
  }

  // Example logic (replace with your actual implementation)
  let pnr = null;

  if (bookingDataId) {
    // generate or retrieve based on bookingDataId
    pnr = `${String(bookingDataId).padStart(6, "0")}`;
  } /* else if (mobileNumber) {
    // generate or retrieve based on mobile number hash
    const hash =
      Math.abs(
        Array.from(mobileNumber).reduce((acc, c) => acc + c.charCodeAt(0), 0)
      ) % 1000000;
    pnr = `PNR${String(hash).padStart(6, "0")}`;
  }*/

  return pnr;
};
module.exports = getPnrNumber;
