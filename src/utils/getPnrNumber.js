const getPnrNumber = (mobile_number) => {
  if (!mobile_number) {
    throw new Error("MobileNumber must be provided");
  }
  let pnr = null;
  const hash =
    Math.abs(
      Array.from(mobile_number).reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % 1000000;
  pnr = `PNR${String(hash).padStart(6, "0")}`;
  return pnr;
};
module.exports = getPnrNumber;
