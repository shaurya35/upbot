import express from "express";

const app = express();

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof Error && err.message === "Not allowed by CORS") {
      res.status(403).json({ error: "CORS not allowed for this origin" });
    } else if (err instanceof SyntaxError) {
      res.status(400).json({ error: "Invalid JSON payload" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default app;
