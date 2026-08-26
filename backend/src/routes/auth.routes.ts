import { Router } from "express";
import passport from "../config/passport";
import { getCurrentUser, logout, googleCallbackRedirect } from "../controllers/auth.controller";
import { env } from "../config/env";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${env.frontendUrl}/login?error=auth_failed`,
  }),
  googleCallbackRedirect
);

router.get("/me", getCurrentUser);
router.post("/logout", logout);

export default router;
