import { processText } from "./index.js";

const text = `Artificial intelligence is transforming the world. It helps doctors diagnose diseases more accurately. Self-driving cars are being developed using machine learning. AI can analyse large amounts of data very quickly. Many companies are investing in AI research. The technology is still growing and improving every year.`;

const result = processText(text);

console.log("\n========= NOTES =========");
result.notes.forEach(n => console.log(n));

console.log("\n======= SUMMARY =========");
result.summary.forEach(s => console.log(" •", s));

console.log("\n====== KEYWORDS =========");
Object.entries(result.keywords).forEach(([w, c]) => console.log(` ${w}: ${c}`));

console.log("\n===== SENTENCES =========");
result.sentences.forEach((s, i) => console.log(`${i + 1}. ${s}`));
