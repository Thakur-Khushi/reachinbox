import { Request, Response } from "express";
import { env } from "../config/env";

export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = req.user as any;
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
  });
}

export function logout(req: Request, res: Response) {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });
}

export function googleCallbackRedirect(_req: Request, res: Response) {
  res.redirect(env.frontendUrl);
}
