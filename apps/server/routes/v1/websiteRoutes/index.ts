import express from "express";
import {
  getAllWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsiteById,
  deleteWebsiteById,
} from "../../../controllers/v1/websiteControllers/websiteControllers";
import { isLoggedIn } from "../../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllWebsites);
router.get("/:id", isLoggedIn, getWebsiteById);
router.post("/", isLoggedIn, createWebsite);
router.put("/:id", isLoggedIn, updateWebsiteById);
router.delete("/:id", isLoggedIn, deleteWebsiteById);

export default router;
