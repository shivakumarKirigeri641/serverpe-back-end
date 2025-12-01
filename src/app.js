const express = require("express");
//require("./crons/mock_Train_Scheduler");
const { connectDB, connectPinCodeDB } = require("./database/connectDB");
const app = new express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dummyRouter = require("./routers/dummyRouter");
const router = require("./pincodes/routes/pincode.routes");
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
app.use("/", router);
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(8888, "0.0.0.0", () => {
      console.log("Server is listening now.");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database: Error:" + err.message);
  });

connectPinCodeDB()
  .then(() => {
    console.log("Pincode Database connected successfully.");
    app.listen(8888, "0.0.0.0", () => {
      console.log("Server is listening now.");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database: Error:" + err.message);
  });
