import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import { previewRecipients } from "../controllers/recipients.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post("/preview", requireAuth, upload.single("file"), previewRecipients);

export default router;
