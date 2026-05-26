import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveRelevantChunks } from "../../services/rag.service.js";

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

export async function generateSmartNotes(text) {
  const prompt = `You are a professional knowledge engineer and elite educational content creator. 
  Create detailed, comprehensive, structured, and plagiarism-free study notes from the following content.
  Use HTML tags suitable for a rich text editor (h1, h2, ul, li, p, strong, blockquote).
  
  Please format the notes using the following structured educational framework:
  1. 📌 CORE KEYWORDS: List 5-10 important terms with clear English definitions and Roman-Urdu / easy Urdu annotations.
  2. 📝 COMPREHENSIVE GUIDE: 3-5 rich, detailed paragraphs explaining the content in simple, conversational English.
  3. 🔍 KEY CONCEPTS EXPLAINED: 5-8 sub-concepts explained with real-world examples.
  4. ❓ FREQUENTLY ASKED QUESTIONS: A dedicated Q&A section answering standard conceptual confusion points.
  5. 💡 PRACTICAL APPLICATIONS & LEARNING GOALS: Simple takeaways and real-world uses.
  
  Content:
  ${text}`;

  return generate(prompt);
}

export async function generateSummary(text, type = 'concise') {
  const prompt = `You are an expert summary writer. Summarize the following content in a ${type} manner, ensuring it is comprehensive, easy to read, and educational.
  Use HTML formatting (p, ul, li, strong).
  
  Provide:
  - A brief overall summary (3-4 paragraphs).
  - Main points with Roman-Urdu/easy Urdu explanations for complex ideas.
  
  Content:
  ${text}`;

  return generate(prompt);
}

export async function askQuestion(content, question) {
  // Retrieve the top 3 most semantically matching chunks from the document
  const retrievedContexts = retrieveRelevantChunks(content, question, 3);
  const contextString = retrievedContexts.join("\n\n---\n\n");

  const prompt = `You are a professional educational assistant. 
  Answer the following question based ONLY on the provided context retrieved from the user's document.
  Use HTML formatting (p, ul, li, strong, em) for the answer.
  
  Retrieved Document Context:
  ${contextString}
  
  Question:
  ${question}
  
  Instructions:
  1. Base your answer directly on the retrieved context segments.
  2. If the context does not contain the answer, tell the user that the specific part of their notes doesn't cover this, but provide the closest inference you can from the notes.
  3. Include simple definitions and keep explanations extremely clear.`;

  return generate(prompt);
}

export async function explainContent(content, level = 'beginner') {
  const prompt = `Explain the following content to an ${level} learner. 
  Use a teaching style and HTML formatting.
  
  Content:
  ${content}`;

  return generate(prompt);
}

export async function generateVisuals(text) {
  const prompt = `You are an expert educational visualizer. 
  Analyze the following text and return a valid JSON object (enclosed in \`\`\`json and \`\`\`) containing:
  1. "keywords": An object with top 5-10 keywords and their importance score (1-10)
  2. "flowchart": A complete Mermaid.js string (e.g. "graph TD\\n  A[Concept A] --> B[Concept B]") representing the process flow or core structural path of the content.
  3. "graph": An object for a D3 force-directed graph:
     {
       "nodes": [ { "id": "ConceptA", "group": 1 } ],
       "links": [ { "source": "ConceptA", "target": "ConceptB" } ]
     }
     representing semantic relationships between key concepts. Note: do not use numeric IDs for source/target in links, use the node's exact string id.
  
  Content:
  ${text}
  
  Format instructions: return ONLY the JSON block. Do not include extra explanation.`;

  const responseText = await generate(prompt);
  
  // Extract JSON from markdown code block if present
  const match = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
  const cleanJson = match ? match[1] : responseText;
  
  try {
    return JSON.parse(cleanJson.trim());
  } catch (error) {
    console.error("Failed to parse visual data from AI:", error.message);
    // Fallback static data
    return {
      keywords: { "Educational Workspace": 10, "Structured Notes": 8, "Concept Mapping": 6 },
      flowchart: "graph TD\n  A[Input Content] --> B[Text Processing]\n  B --> C[Visual Insights]",
      graph: {
        nodes: [{ id: "Input Content", group: 1 }, { id: "Text Processing", group: 1 }, { id: "Visual Insights", group: 2 }],
        links: [{ source: "Input Content", target: "Text Processing" }, { source: "Text Processing", target: "Visual Insights" }]
      }
    };
  }
}
