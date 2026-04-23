/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

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

app.get("/api/progress/:clientId", async (req, res) => {
  const { clientId } = req.params;

  if (!clientId || clientId.length < 8) {
    res.status(400).json({ error: "Invalid clientId" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("tracker_progress")
      .select("snapshot, updated_at")
      .eq("client_id", clientId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    res.json({
      snapshot: data?.snapshot || null,
      updatedAt: data?.updated_at || null,
    });
  } catch (error) {
    console.error("GET /api/progress failed:", error);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

app.put("/api/progress/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const snapshot = req.body?.snapshot;

  if (!clientId || clientId.length < 8) {
    res.status(400).json({ error: "Invalid clientId" });
    return;
  }

  if (!snapshot || typeof snapshot !== "object") {
    res.status(400).json({ error: "Invalid snapshot payload" });
    return;
  }

  try {
    const { error } = await supabase.from("tracker_progress").upsert(
      {
        client_id: clientId,
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
    console.error("PUT /api/progress failed:", error);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

app.listen(port, () => {
  console.log(`Habit tracker API listening on http://localhost:${port}`);
});
