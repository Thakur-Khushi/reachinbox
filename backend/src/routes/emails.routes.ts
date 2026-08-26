import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { listScheduled, listSent } from "../controllers/emails.controller";

const router = Router();

router.get("/scheduled", requireAuth, listScheduled);
router.get("/sent", requireAuth, listSent);

export default router;
