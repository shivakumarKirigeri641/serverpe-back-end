// 1A - First AC (Compartments)
const getSeatType1A = (seatNo) => {
  if (seatNo >= 1 && seatNo <= 2) {
    return seatNo === 1 ? "A-LB" : "A-UB";
  } else if (seatNo >= 3 && seatNo <= 6) {
    const map = ["B-LB", "B-UB", "B-LB", "B-UB"];
    return map[seatNo - 3];
  } else if (seatNo >= 7 && seatNo <= 10) {
    const map = ["C-LB", "C-UB", "C-LB", "C-UB"];
    return map[seatNo - 7];
  } else if (seatNo >= 11 && seatNo <= 14) {
    const map = ["D-LB", "D-UB", "D-LB", "D-UB"];
    return map[seatNo - 11];
  } else if (seatNo >= 15 && seatNo <= 18) {
    const map = ["E-LB", "E-UB", "E-LB", "E-UB"];
    return map[seatNo - 15];
  } else if (seatNo >= 19 && seatNo <= 22) {
    const map = ["F-LB", "F-UB", "F-LB", "F-UB"];
    return map[seatNo - 19];
  } else if (seatNo >= 23 && seatNo <= 24) {
    return seatNo === 23 ? "G-LB" : "G-UB";
  } else {
    return "INVALID";
  }
};

module.exports = getSeatType1A;
