const express = require("express");
//require("./crons/mock_Train_Scheduler");
const {
  connectMockTrainTicketsDb,
  connectPinCodeDB,
  connectCarSpecsDB,
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
const dummyrouter = require("./routers/dummyrouter");
const checkApiKey = require("./middleware/checkApiKey");
require("dotenv").config();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:1234", "http://192.168.10.63:5173"],
    credentials: true,
  })
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", mockTrainReservedTicketRouter);
app.use("/", generalRouter);
app.use("/", dummyrouter);
app.use("/", pincodeRouter);
app.use("/", userRouter);
connectMockTrainTicketsDb();
connectPinCodeDB();
connectCarSpecsDB();
connectMainDB();
app.listen(8888, "0.0.0.0", () => {
  console.log("Server is listening now.");
});
