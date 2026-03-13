import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/apiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware stack: CORS, JSON body parser, and URL-encoded support.
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api so the frontend can call /api/... endpoints.
app.use("/api", apiRouter);

// Simple health check route.
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "docuchat-ai-server" });
});

app.listen(PORT, () => {
  // Use console logging here for simplicity. In a real production
  // system you would typically wire a structured logger.
  // eslint-disable-next-line no-console
  console.log(`DocuChat AI server listening on http://localhost:${PORT}`);
});

