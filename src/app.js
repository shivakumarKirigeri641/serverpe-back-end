const express = require("express");
//require("./crons/mock_Train_Scheduler");
const {
  connectMockTrainTicketsDb,
  connectPinCodeDB,
  connectIFSCDB,
  connectMainDB,
} = require("./database/connectDB");
const app = new express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dummyRouter = require("./routers/dummyRouter");
const generalRouter = require("./routers/generalRouter");
const userRouter = require("./routers/userRouter");
const dummyRouterPinCode = require("./routers/dummyRouterPinCode");
require("dotenv").config();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:1234", "http://192.168.10.63:5173"],
    credentials: true,
  })
);
app.use("/", dummyRouter);
app.use("/", generalRouter);
app.use("/", userRouter);
app.use("/", dummyRouterPinCode);
connectMockTrainTicketsDb();
connectPinCodeDB();
connectIFSCDB();
connectMainDB();
app.listen(8888, "0.0.0.0", () => {
  console.log("Server is listening now.");
});
