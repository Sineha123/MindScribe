import express from "express";
import { askQuestion, explainContent, generateSummary } from "./ai.service.js";

const router = express.Router();

router.post("/summary", async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      const error = new Error("Text is required for AI summary.");
      error.statusCode = 400;
      throw error;
    }

    const result = await generateSummary(text.trim());

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post("/ask", async (req, res, next) => {
  try {
    const { content, question } = req.body;

    if (!content || !content.trim()) {
      const error = new Error("Content is required for Q&A.");
      error.statusCode = 400;
      throw error;
    }

    if (!question || !question.trim()) {
      const error = new Error("Question is required.");
      error.statusCode = 400;
      throw error;
    }

    const result = await askQuestion(content.trim(), question.trim());

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post("/explain", async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      const error = new Error("Content is required for explanation.");
      error.statusCode = 400;
      throw error;
    }

    const result = await explainContent(content.trim());

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
