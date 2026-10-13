import express from "express";

import { getProfile, updateProfile } from "../../../controllers/v1/profileControllers";
import { isLoggedIn } from "../../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getProfile);
router.put("/", isLoggedIn, updateProfile);

export default router;
