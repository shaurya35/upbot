import express from "express";
import {
  getAllAlertChannels,
  getAlertChannelById,
  createAlertChannel,
  updateAlertChannelById,
  deleteAlertChannelById,
} from "../../../controllers/v1/alertControllers/alertControllers";
import { isLoggedIn } from "../../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getAllAlertChannels);
router.get("/:id", isLoggedIn, getAlertChannelById);
router.post("/", isLoggedIn, createAlertChannel);
router.put("/:id", isLoggedIn, updateAlertChannelById);
router.delete("/:id", isLoggedIn, deleteAlertChannelById);

export default router;
