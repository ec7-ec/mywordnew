import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory or file-backed cloud sync store
const SAVES_FILE = path.join(process.cwd(), "cloud_saves_data.json");
let syncStore: Record<string, { data: any; updatedAt: string }> = {};

// Load existing saves if present
if (fs.existsSync(SAVES_FILE)) {
  try {
    const raw = fs.readFileSync(SAVES_FILE, "utf-8");
    syncStore = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load cloud saves data file:", err);
  }
}

function saveStoreToFile() {
  try {
    fs.writeFileSync(SAVES_FILE, JSON.stringify(syncStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save sync store:", err);
  }
}

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Minecraft Study Planner Server Running" });
});

// Cloud Save Sync API - Save
app.post("/api/sync/save", (req, res) => {
  try {
    const { code, payload } = req.body;
    if (!code || typeof code !== "string" || code.trim().length < 4) {
      return res.status(400).json({ error: "Invalid sync code. Minimum 4 characters." });
    }
    const sanitizedCode = code.trim().toUpperCase();
    syncStore[sanitizedCode] = {
      data: payload,
      updatedAt: new Date().toISOString(),
    };
    saveStoreToFile();
    return res.json({
      success: true,
      syncCode: sanitizedCode,
      updatedAt: syncStore[sanitizedCode].updatedAt,
    });
  } catch (error: any) {
    console.error("Error saving sync data:", error);
    return res.status(500).json({ error: "Server error saving data." });
  }
});

// Cloud Save Sync API - Load
app.get("/api/sync/load/:code", (req, res) => {
  try {
    const sanitizedCode = req.params.code.trim().toUpperCase();
    const entry = syncStore[sanitizedCode];
    if (!entry) {
      return res.status(404).json({ error: "Sync code not found or expired." });
    }
    return res.json({
      success: true,
      syncCode: sanitizedCode,
      data: entry.data,
      updatedAt: entry.updatedAt,
    });
  } catch (error: any) {
    console.error("Error loading sync data:", error);
    return res.status(500).json({ error: "Server error loading data." });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Minecraft Study Planner] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
