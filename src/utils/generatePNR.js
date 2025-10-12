const generatePNR = (id) => {
  // Convert ID to string
  const idStr = id.toString().padStart(6, "0"); // pad with zeros if needed

  // Current date in YYMMDD format
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");

  // Random 3-character alphanumeric string
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();

  // Combine to create PNR
  const pnr = `${yy}${mm}${dd}${idStr}${randomStr}`;
  return pnr;
};
module.exports = generatePNR;
