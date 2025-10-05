const getSeatType3A = require("./getSeatType3A");
const getSeatStringA3 = (
  train_number,
  display_name_prefix,
  bogi_count,
  total_seat_count,
  seat_general,
  seat_rac,
  seat_tatkal,
  seat_premium_tatkal,
  name
) => {
  let overallseatcount = 1;
  let seatStringForTrain = "";
  let bogi_index = 1;
  try {
    for (let bogi = 0; bogi < bogi_count; bogi++) {
      let seatcount = 1;
      //gen
      for (let seat = 0; seat < seat_general; seat++) {
        seatStringForTrain =
          seatStringForTrain +
          "@" +
          train_number +
          "/" +
          display_name_prefix +
          bogi_index +
          "/" +
          overallseatcount +
          "/" +
          seatcount++ +
          "/" +
          getSeatType3A(seatcount - 1) +
          "/GEN/AVL@";
        overallseatcount++;
      }
      //rac
      for (let seat = 0; seat < seat_rac; seat++) {
        seatStringForTrain =
          seatStringForTrain +
          "@" +
          train_number +
          "/" +
          display_name_prefix +
          bogi_index +
          "/" +
          overallseatcount +
          "/" +
          seatcount++ +
          "/" +
          getSeatType3A(seatcount - 1) +
          "/RAC/AVL@";
        overallseatcount++;
      }
      //ttk
      for (let seat = 0; seat < seat_tatkal; seat++) {
        seatStringForTrain =
          seatStringForTrain +
          "@" +
          train_number +
          "/" +
          display_name_prefix +
          bogi_index +
          "/" +
          overallseatcount +
          "/" +
          seatcount++ +
          "/" +
          getSeatType3A(seatcount - 1) +
          "/TTL/AVL@";
        overallseatcount++;
      }
      //ptk
      for (let seat = 0; seat < seat_premium_tatkal; seat++) {
        seatStringForTrain =
          seatStringForTrain +
          "@" +
          train_number +
          "/" +
          display_name_prefix +
          bogi_index +
          "/" +
          overallseatcount +
          "/" +
          seatcount++ +
          "/" +
          getSeatType3A(seatcount - 1) +
          "/PTL/AVL@";
        overallseatcount++;
      }
      bogi_index++;
    }
    return seatStringForTrain;
  } catch (err) {
    throw err;
  }
};
module.exports = getSeatStringA3;
