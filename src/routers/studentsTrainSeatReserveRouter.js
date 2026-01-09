const express = require("express");
const studentsTrainSeatReserveRouter = express.Router();

studentsTrainSeatReserveRouter.get("/mockapis/serverpeuser/api/mocktrain/reserved/stations", (req, res) => {
  res.send("Students Train Seat Reserve");
});

module.exports = studentsTrainSeatReserveRouter;