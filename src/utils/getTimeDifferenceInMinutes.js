const getTimeDifferenceInMinutes = (date1, date2) => {
  date1 = new Date(date1).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const t1 = parseIndianDate(date1);
  const t2 = parseIndianDate(date2);

  const diffMinutes = Math.floor((t1 - t2) / (1000 * 60));
  return diffMinutes;
};
function parseIndianDate(str) {
  const [datePart, timePart, meridian] = str
    .split(/,| /)
    .map((s) => s.trim())
    .filter(Boolean);

  const [d, m, y] = datePart.split("/").map(Number);
  let [h, min, sec] = timePart.split(":").map(Number);

  if (meridian.toLowerCase() === "pm" && h !== 12) h += 12;
  if (meridian.toLowerCase() === "am" && h === 12) h = 0;

  return new Date(y, m - 1, d, h, min, sec);
}
module.exports = getTimeDifferenceInMinutes;
