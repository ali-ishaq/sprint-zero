import "dotenv/config";
import express from "express";
import cookieSession from "cookie-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initFirestore } from "./lib/firestore.js";
import authRoutes from "./routes/auth.js";
import processRoutes from "./routes/process.js";
import runsRoutes from "./routes/runs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const crossSiteCookies = process.env.CROSS_SITE_COOKIES === "true";
const secureCookies = crossSiteCookies
  ? true
  : process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked for this origin"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: secureCookies,
    sameSite: crossSiteCookies ? "none" : "lax",
  }),
);

initFirestore();

app.use("/api/auth", authRoutes);
app.use("/api/process", processRoutes);
app.use("/api/runs", runsRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`SprintZero server running on http://localhost:${PORT}`);
});
