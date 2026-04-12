// ─────────────────────────────────────────────────────────────
//  notes.routes.js
//  PURPOSE: Define all API routes related to notes processing.
//
//  What is express.Router()?
//    - A mini Express application for a specific feature.
//    - Keeps routes modular — we mount it in app.js under a prefix.
//    - All routes here automatically get the /api/notes prefix.
// ─────────────────────────────────────────────────────────────

import express from "express";
import { processNotes } from "../services/notes.service.js";

const router = express.Router();

// ─── POST /api/notes/process-text ─────────────────────────────
//
//  Flow:
//    1. Client sends { "text": "..." } in the JSON body
//    2. We extract it from req.body
//    3. Pass it to the service → core engine
//    4. Return the enriched result as JSON
//
//  On error, we call next(error) → error middleware catches it
// ──────────────────────────────────────────────────────────────
router.post("/process-text", (req, res, next) => {
  try {
    const { text } = req.body;

    const result = processNotes(text);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    // Forward to the global error handler (error.middleware.js)
    next(error);
  }
});

export default router;
