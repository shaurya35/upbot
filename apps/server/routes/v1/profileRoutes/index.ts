import express from "express";

import { getProfile } from "../../../controllers/v1/profileControllers"

const router = express.Router();

router.post("/", getProfile);

export default router;