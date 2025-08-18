import express from "express";
import {getAllWebsites, getWebsiteById, createWebsite, updateWebsiteById, deleteWebsiteById } from "../../../controllers/v1/websiteControllers/websiteControllers"

const router = express.Router();

router.get("/", getAllWebsites);
router.get("/:id", getWebsiteById);
router.post("/", createWebsite);
router.put("/:id", updateWebsiteById);
router.delete("/:id", deleteWebsiteById);

export default router;