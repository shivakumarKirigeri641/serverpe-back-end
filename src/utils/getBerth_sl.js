const getBerth_sl = (seatNo) => {
  const pattern = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];
  const index = (seatNo - 1) % 8;
  return pattern[index];
};
module.exports = getBerth_sl;
