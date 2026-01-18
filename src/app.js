const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { connectTrainSeatDb, connectMainDB } = require("./database/connectDB");

const generalRouter = require("./routers/generalRouter");
const userRouter = require("./routers/userRouter");
const adminRouter = require("./routers/adminRouter");
const trainRouter = require("./routers/trainRouter");
const apiLogger = require("./middleware/apiLogger");

const PORT = process.env.PORT || 8888;
const app = express();

/* 🔐 MUST be before CORS & cookies */
app.set("trust proxy", 1);

app.use(express.json());

/* 📝 API Logging */
app.use(apiLogger);

/* ✅ CORS for cross-subdomain cookies */
app.use(
  cors({
    origin: ["https://serverpe.in", "https://admin.serverpe.in"],
    credentials: true,
  }),
);
/*app.use(
  cors({
    origin: ["http://localhost:1234", "http://localhost:3001"],
    credentials: true,
  })
);*/
app.use(cookieParser());

/* Health check */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "ServerPe API",
    message: "API is running successfully 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "ServerPe API",
  });
});

/* Static files */
app.use("/images", express.static(path.join(__dirname, "images")));

/* Routes */
app.use("/", generalRouter);
app.use("/", userRouter);
app.use("/", trainRouter);
app.use("/admin", adminRouter);

/* DB connections */
connectMainDB();
connectTrainSeatDb();

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
