const express = require("express");
require("./crons/mock_Train_Scheduler");
const { connectDB } = require("./database/connectDB");
const app = new express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
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
app.use("/", dummyRouter);
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
