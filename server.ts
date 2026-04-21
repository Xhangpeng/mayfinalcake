import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import app from "./api/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve service worker and manifest with proper headers
    app.get("/sw.js", (req, res) => {
      res.type("application/javascript");
      res.set("Cache-Control", "public, max-age=0, must-revalidate");
      res.sendFile(path.join(distPath, "sw.js"));
    });

    app.get("/manifest.json", (req, res) => {
      res.type("application/manifest+json");
      res.set("Cache-Control", "public, max-age=3600");
      res.sendFile(path.join(distPath, "manifest.json"));
    });

    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith(".js") || path.endsWith(".css")) {
          res.set("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
