import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createCampaign } from "../controllers/campaigns.controller";

const router = Router();

router.post("/", requireAuth, createCampaign);

export default router;
