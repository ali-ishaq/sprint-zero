import "dotenv/config";
import express from "express";
import cookieSession from "cookie-session";
import path from "path";
import { fileURLToPath } from "url";
import { initFirestore } from "./lib/firestore.js";
import authRoutes from "./routes/auth.js";
import processRoutes from "./routes/process.js";
import runsRoutes from "./routes/runs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
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

app.use((req, res, next) => {
  const origin = req.get("Origin");
  // Requests from a page served by this very server (same origin) are not
  // cross-origin and need no CORS grant. Browsers still send an `Origin`
  // header for credentialed fetches even on same-origin calls, so compare
  // against the server's own host rather than relying on the allowlist.
  const sameOrigin =
    origin && origin === req.protocol + "://" + req.get("host");
  const allowed =
    !origin || sameOrigin || allowedOrigins.includes(origin);

  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  if (!allowed) {
    console.error(
      `CORS blocked origin: "${origin}" (allowlist: ${allowedOrigins.join(", ") || "<none>"})`,
    );
    return next(new Error("CORS blocked for this origin"));
  }

  next();
});

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

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SprintZero server running on http://localhost:${PORT}`);
});
