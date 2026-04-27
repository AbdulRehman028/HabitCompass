/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const supabase = require("./supabaseClient");

const app = express();
const port = Number(process.env.API_PORT || 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = user;
  next();
}

app.get("/api/progress/me", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("tracker_progress")
      .select("snapshot, updated_at")
      .eq("client_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({
      snapshot: data?.snapshot || null,
      updatedAt: data?.updated_at || null,
    });
  } catch (error) {
    console.error("GET /api/progress/me failed:", error);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

app.put("/api/progress/me", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const snapshot = req.body?.snapshot;

  if (!snapshot || typeof snapshot !== "object") {
    res.status(400).json({ error: "Invalid snapshot payload" });
    return;
  }

  try {
    const { error } = await supabase.from("tracker_progress").upsert(
      {
        client_id: userId,
        snapshot,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "client_id",
      }
    );

    if (error) {
      throw error;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/progress/me failed:", error);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

app.listen(port, () => {
  console.log(`Habit tracker API listening on http://localhost:${port}`);
});
