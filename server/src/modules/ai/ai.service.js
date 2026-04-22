import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

function getModel() {
  if (!apiKey) {
    const error = new Error("Missing GEMINI_API_KEY. Add it to your .env file.");
    error.statusCode = 500;
    throw error;
  }

  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: "gemini-2.5-flash" });
}

async function generate(prompt) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateSummary(text) {
  const prompt = `You are an expert teacher. Summarize clearly and concisely.

Content:
${text}`;

  return generate(prompt);
}

export async function askQuestion(content, question) {
  const prompt = `Answer ONLY based on the given content.

Content:
${content}

Question:
${question}`;

  return generate(prompt);
}

export async function explainContent(content) {
  const prompt = `Explain in simple beginner-friendly language.

Content:
${content}`;

  return generate(prompt);
}
