const get1ASeatDetails = require("./get1ASeatDetails");
const getFCSeatDetails = require("./getFCSeatDetails");
const getCoachSeatAndBerth = (seatid, coach_type) => {
  coach_type = coach_type.toUpperCase();
  const coachDetails = {
    // Sleeper
    SL: {
      seatsPerCoach: 72,
      berthPattern: ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"],
    },
    // 3rd AC
    "3A": {
      seatsPerCoach: 64,
      berthPattern: ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"],
    },
    // Economy 3AC
    E3: {
      seatsPerCoach: 83,
      berthPattern: ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"],
    },
    // 2nd AC
    "2A": {
      seatsPerCoach: 46,
      berthPattern: ["LB", "UB", "LB", "UB", "SL", "SU"],
    },
    // 1st AC
    "1A": {
      seatsPerCoach: 24,
      berthPattern: ["LB", "UB"],
    },
    // First Class (non-AC)
    FC: {
      seatsPerCoach: 22,
      berthPattern: ["LB", "UB"],
    },
    // Chair Car
    CC: {
      seatsPerCoach: 78,
      berthPattern: ["WS", "MS", "AS", "WS", "MS", "AS"], // Window, Middle, Aisle
    },
    // Executive Chair Car
    EC: {
      seatsPerCoach: 46,
      berthPattern: ["WS", "AS", "WS", "AS"],
    },
    // Vande Bharat Executive Chair Car
    EA: {
      seatsPerCoach: 56,
      berthPattern: ["WS", "AS", "WS", "AS"],
    },
    // Vande Bharat AC Chair Cars (Economy)
    EV: {
      seatsPerCoach: 78,
      berthPattern: ["WS", "MS", "AS", "WS", "MS", "AS"],
    },
    // Vistadome Chair Car
    VC: {
      seatsPerCoach: 44,
      berthPattern: ["WS", "AS", "WS", "AS"],
    },
    // Vistadome Sleeper / Scenic Coach
    VS: {
      seatsPerCoach: 40,
      berthPattern: ["LB", "UB", "LB", "UB"],
    },
    // Second Sitting (2S)
    "2S": {
      seatsPerCoach: 103,
      berthPattern: ["WS", "MS", "AS", "WS", "MS", "AS"],
    },
  };

  const details =
    coach_type === "1A"
      ? get1ASeatDetails(seatid)
      : coach_type === "FC"
      ? getFCSeatDetails(seatid)
      : coachDetails[coach_type];
  if (!details) {
    throw new Error(`Unknown coach type: ${coachType}`);
  }

  const { seatsPerCoach, berthPattern } = details;
  let message = "";
  const coachNumber =
    coach_type === ("1A" || "FC") ? "CNF" : Math.ceil(seatid / seatsPerCoach);
  const seatPosition =
    coach_type === ("1A" || "FC") ? "CNF" : ((seatid - 1) % seatsPerCoach) + 1;
  const berthType =
    coach_type === ("1A" || "FC")
      ? "CNF"
      : berthPattern[(seatPosition - 1) % berthPattern.length];
  message =
    coach_type === ("1A" || "FC")
      ? "Coach/seat/berth will be alloted after chart preparation."
      : "";
  return {
    coach: `${coach_type}${coachNumber}`,
    seatPosition,
    berthType,
    message,
  };
};
module.exports = getCoachSeatAndBerth;
