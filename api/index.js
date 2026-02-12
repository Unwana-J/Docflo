import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "../server/src/config.js";
import authRoutes from "../server/src/routes/auth.js";
import teamRoutes from "../server/src/routes/teams.js";

const app = express();

app.use(
  cors({
    origin: config.frontendBaseUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(500).json({ error: "internal_error" });
});

export default app;
