// 2A - AC 2 Tier
const getSeatType2A = (seatNo) => {
  switch (seatNo % 6) {
    case 1:
      return "LB";
    case 2:
      return "UB";
    case 3:
      return "LB";
    case 4:
      return "UB";
    case 5:
      return "SL";
    case 0:
      return "SU";
  }
};
module.exports = getSeatType2A;
