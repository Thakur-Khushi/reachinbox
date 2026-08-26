import express from "express";
import cors from "cors";
import session from "express-session";
import RedisStore from "connect-redis";
import { env } from "./config/env";
import { redis } from "./config/redis";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import recipientsRoutes from "./routes/recipients.routes";
import campaignsRoutes from "./routes/campaigns.routes";
import emailsRoutes from "./routes/emails.routes";

export const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redis, prefix: "sess:" }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/api/recipients", recipientsRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/emails", emailsRoutes);
