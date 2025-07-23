import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ message: "Health Check!" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS not allowed for this origin" });
  } else if (err instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON payload" });
  } else {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

import authRoutes from "./routes/v1/authRoutes/authRoutes";

app.use("/api/v1/auth", authRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
