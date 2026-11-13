import express from "express";
import {
  getAllWebsites,
  getWebsiteById,
  getWebsiteStats,
  getWebsiteChecks,
  getWebsiteIncidents,
} from "../../../controllers/v1/websiteControllers/websiteControllers";

const router = express.Router();
router.use((req, res, next) => {
  if (!process.env.DEMO_USER_ID)
    return res.status(503).json({ error: "Demo is not configured" });
  (req as any).user = { id: process.env.DEMO_USER_ID };
  next();
});
router.get("/websites", getAllWebsites);
router.get("/websites/:id", getWebsiteById);
router.get("/websites/:id/stats", getWebsiteStats);
router.get("/websites/:id/checks", getWebsiteChecks);
router.get("/websites/:id/incidents", getWebsiteIncidents);
export default router;
