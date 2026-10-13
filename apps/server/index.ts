import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.json({ message: "Health Check!" });
});

import authRoutes from "./routes/v1/authRoutes";
import profileRoutes from "./routes/v1/profileRoutes";
import websiteRoutes from "./routes/v1/websiteRoutes";
import alertRoutes from "./routes/v1/alertRoutes";
import { errorHandler } from "./middlewares/error";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/website", websiteRoutes);
app.use("/api/v1/alert", alertRoutes);

app.use(errorHandler);

for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
  if (!process.env[key]) {
    console.error(`${key} is not set. Run \`bun run dev\` from the repo root to generate .env.`);
    process.exit(1);
  }
}

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
