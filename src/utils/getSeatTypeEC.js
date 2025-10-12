// EC - Executive Chair Car (2+2)
const getSeatTypeEC = (seatNo) => {
  switch (seatNo % 4) {
    case 1:
      return "WS";
    case 2:
      return "AS";
    case 3:
      return "AS";
    case 0:
      return "WS";
  }
};
module.exports = getSeatTypeEC;
