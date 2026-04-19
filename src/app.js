const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { connectDB } = require("./database/connectDB");
const { globalLimiter } = require("./middlewares/rateLimiter");
const publicRouter = require("./routers/publicRouter");
const PORT = process.env.PORT;
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
    origin: ["https://serverpe.in", "https://admin.serverpe.in"],
    credentials: true,
  }),
);
/*app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);*/
app.use(cookieParser());

/* 🛡️ Global rate limiter – 200 requests/min per IP */
app.use(globalLimiter);

/* Health check */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "serverpeappsolutions API",
    message: "API is running successfully 🚀",
  });
});

/* Static files */

/* Routes */
app.use("/", publicRouter);
/* DB connections */
connectDB();

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
