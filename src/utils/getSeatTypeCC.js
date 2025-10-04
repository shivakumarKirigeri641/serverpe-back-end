// CC - Chair Car (3+2)
const getSeatTypeCC = (seatNo) => {
  switch (seatNo % 5) {
    case 1:
      return "WS"; // Window
    case 2:
      return "MS"; // Middle
    case 3:
      return "AS"; // Aisle
    case 4:
      return "AS";
    case 0:
      return "WS";
  }
};
module.exports = getSeatTypeCC;
