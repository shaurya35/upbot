import express from "express";
import {
  getAllAlertChannels,
  getAlertChannelById,
  createAlertChannel,
  updateAlertChannelById,
  deleteAlertChannelById,
} from "../../../controllers/v1/alertControllers/alertControllers";

const router = express.Router();

router.get("/", getAllAlertChannels);
router.get("/:id", getAlertChannelById);
router.post("/", createAlertChannel);
router.put("/:id", updateAlertChannelById);
router.delete("/:id", deleteAlertChannelById);

export default router;
