import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ message: "Health Check!" });
});

import authRoutes from "./routes/v1/authRoutes"
import websiteRoutes from "./routes/v1/websiteRoutes/websiteRoutes";
import alertRoutes from "./routes/v1/alertRoutes/alertRoutes"
// import teamRoutes from "./routes/v1/teamRoutes/teamRoutes"

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/website", websiteRoutes);
app.use("/api/v1/alert", alertRoutes);
// app.use("/api/v1/team", teamRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
