// 3A - AC 3 Tier
const getSeatType3A = (seatNo) => {
  switch (seatNo % 8) {
    case 1:
      return "LB";
    case 2:
      return "MB";
    case 3:
      return "UB";
    case 4:
      return "LB";
    case 5:
      return "MB";
    case 6:
      return "UB";
    case 7:
      return "SL";
    case 0:
      return "SU";
  }
};
module.exports = getSeatType3A;
