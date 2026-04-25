import dns from "node:dns";
import express from "express";
import { config } from "dotenv";

/** Reduces OpenAI / outbound TLS failures on dual-stack networks (Node defaults to IPv6 first). */
dns.setDefaultResultOrder("ipv4first");
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { errorMiddleware } from "./middlewares/error.middleware";
import { connectDb } from "./config/dbConnection";
import { ensureUploadDir } from "./config/uploadAudio";
// Routes imports
import authRoute from "./routes/auth.route";
import interviewRoute from "./routes/interview.route";
import sessionRoute from "./routes/session.route";

config();
ensureUploadDir();

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
// For url inputs
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.disable("x-powered-by");
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Interra API — auth, interviews, sessions",
    docs: "/api/v1/auth, /api/v1/interviews, /api/v1/sessions",
  });
});

// Routes (doc-aligned paths under /api/v1)
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/interviews", interviewRoute);
app.use("/api/v1/sessions", sessionRoute);

// Middlewares
app.use(errorMiddleware);

// Listen To Server
const PORT = process.env.PORT || 5000;
// Connect To database first then start the server
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[api] Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("[api] Cannot start — fix MongoDB URI and ensure mongod is running.");
    console.error(error);
    process.exit(1);
  });
