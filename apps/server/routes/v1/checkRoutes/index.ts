import express from "express";

import { isLoggedIn } from "../../../middlewares/auth";

import { getAllChecks } from "../../../controllers/v1/checkControllers";

const router = express.Router();

router.get("/:websiteId", isLoggedIn, getAllChecks);

export default router;