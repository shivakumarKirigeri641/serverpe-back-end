const express = require("express");
const { connectDB } = require("./database/connectDB");
const app = new express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sendOtpRouter = require("./routers/sendOtpRouter");
const verifyOtpRouter = require("./routers/verifyOtpRouter");
const stationsRouter = require("./routers/stationsRouter");
const logoutRouter = require("./routers/logoutRouter");
const dummyRouter = require("./routers/dummyRouter");
require("dotenv").config();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:1234",
    credentials: true,
  })
);

app.use("/", sendOtpRouter);
app.use("/", verifyOtpRouter);
app.use("/", stationsRouter);
app.use("/", logoutRouter);
app.use("/", dummyRouter);
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(8888, () => {
      console.log("Server is listening now.");
    });
  })
  .catch((err) => {
    console.log("Error in connecting database: Error:" + err.message);
  });
