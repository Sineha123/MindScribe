// ─────────────────────────────────────────────────────────────
//  app.js
//  PURPOSE: Create and configure the Express application.
//
//  Why separate app.js from server.js?
//    - app.js = the configured Express app (pure logic, testable)
//    - server.js = the listener (starts the HTTP server)
//    - This separation lets you import app.js in tests without
//      actually binding to a port.
// ─────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import notesRoutes from "./routes/notes.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ─── CORS ────────────────────────────────────────────────────
// Allows the browser (file:// or any origin) to reach this API.
// Without this the browser blocks cross-origin fetch() calls.
app.use(cors());

// ─── BUILT-IN MIDDLEWARE ──────────────────────────────────────
// express.json() parses incoming requests with JSON payloads
// and makes the data available at req.body
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────
// A simple GET / endpoint so you can quickly verify the server
// is live (useful in production deployments too)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🧠 MindScribe API is running",
    version: "1.0.0"
  });
});

// ─── ROUTES ──────────────────────────────────────────────────
// Mount notesRoutes under /api/notes
// Any route defined in notes.routes.js now lives at:
//   /api/notes/...
app.use("/api/notes", notesRoutes);

// ─── ERROR MIDDLEWARE ─────────────────────────────────────────
// MUST be registered AFTER all routes.
// Express knows this is an error handler because it has 4 params.
app.use(errorHandler);

export default app;
