import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = ["http://localhost:3000"];

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
// import teamRoutes from "./routes/v1/teamRoutes/teamRoutes"

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/website", websiteRoutes);
app.use("/api/v1/alert", alertRoutes);
// app.use("/api/v1/team", teamRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
