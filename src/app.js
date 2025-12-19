const express = require("express");
//require("./crons/mock_Train_Scheduler");
const {
  connectMockTrainTicketsDb,
  connectPinCodeDB,
  connectCarSpecsDB,
  connectBikeSpecsDB,
  connectMainDB,
} = require("./database/connectDB");
const path = require("path");
const app = new express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mockTrainReservedTicketRouter = require("./routers/mockTrainReservedTicketRouter");
const generalRouter = require("./routers/generalRouter");
const userRouter = require("./routers/userRouter");
const pincodeRouter = require("./routers/pincodeRouter");
const carspecrouter = require("./routers/carspecrouter");
const bikespecrouter = require("./routers/bikespecrouter");
const checkApiKey = require("./middleware/checkApiKey");
const demoCorsMiddleware = require("./middleware/demoCorsMiddleware");
require("dotenv").config();
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    req.latency = Date.now() - start; // store latency in ms
  });
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:1234",
    credentials: true,
  })
);
app.use(demoCorsMiddleware);
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", mockTrainReservedTicketRouter);
app.use("/", generalRouter);
app.use("/", carspecrouter);
app.use("/", bikespecrouter);
app.use("/", pincodeRouter);
app.use("/", userRouter);
connectMockTrainTicketsDb();
connectPinCodeDB();
connectCarSpecsDB();
connectBikeSpecsDB();
connectMainDB();
app.listen(8888, "0.0.0.0", () => {
  console.log("Server is listening now.");
});
