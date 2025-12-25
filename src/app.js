const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const {
  connectMockTrainTicketsDb,
  connectPinCodeDB,
  connectCarSpecsDB,
  connectBikeSpecsDB,
  connectMainDB,
} = require("./database/connectDB");

const mockTrainReservedTicketRouter = require("./routers/mockTrainReservedTicketRouter");
const generalRouter = require("./routers/generalRouter");
const userRouter = require("./routers/userRouter");
const pincodeRouter = require("./routers/pincodeRouter");
const carspecrouter = require("./routers/carspecrouter");
const bikespecrouter = require("./routers/bikespecrouter");
const demoCorsMiddleware = require("./middleware/demoCorsMiddleware");

const PORT = process.env.PORT || 8888;
const app = express();

/* 🔐 MUST be before CORS & cookies */
app.set("trust proxy", 1);

/* Measure latency */
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    req.latency = Date.now() - start;
  });
  next();
});

app.use(express.json());

/* ✅ CORS for cross-subdomain cookies */
app.use(
  cors({
    origin: [
      "https://serverpe.in",
      "https://admin.serverpe.in",
      "https://carspecs.serverpe.in",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(demoCorsMiddleware);

/* Health check */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ServerPe API",
    message: "API is running successfully 🚀",
  });
});

/* Static files */
app.use("/images", express.static(path.join(__dirname, "images")));

/* Routes */
app.use("/", mockTrainReservedTicketRouter);
app.use("/", generalRouter);
app.use("/", carspecrouter);
app.use("/", bikespecrouter);
app.use("/", pincodeRouter);
app.use("/", userRouter);

/* DB connections */
connectMainDB();
connectMockTrainTicketsDb();
connectPinCodeDB();
connectCarSpecsDB();
connectBikeSpecsDB();

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
