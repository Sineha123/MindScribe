import express from "express";
import { askQuestion, explainContent, generateSummary, generateSmartNotes, generateVisuals } from "./ai.service.js";

const router = express.Router();

router.post("/notes", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) throw new Error("Text is required");
    const result = await generateSmartNotes(text);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/summary", async (req, res, next) => {
  try {
    const { text, type } = req.body;
    if (!text) throw new Error("Text is required");
    const result = await generateSummary(text, type);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/ask", async (req, res, next) => {
  try {
    const { content, question } = req.body;
    if (!content || !question) throw new Error("Content and question are required");
    const result = await askQuestion(content, question);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/explain", async (req, res, next) => {
  try {
    const { content, level } = req.body;
    if (!content) throw new Error("Content is required");
    const result = await explainContent(content, level);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/visuals", async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) throw new Error("Text is required");
    const result = await generateVisuals(text);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
