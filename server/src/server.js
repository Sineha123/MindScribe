// ─────────────────────────────────────────────────────────────
//  server.js
//  PURPOSE: Start the HTTP server.
//
//  Why is this the only file that calls app.listen()?
//    - Keeps the app logic (app.js) completely separate from
//      the network binding code.
//    - Makes app.js easily importable for automated tests.
// ─────────────────────────────────────────────────────────────

import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log(`  🧠 MindScribe Server`);
  console.log(`  ✅ Running on: http://localhost:${PORT}`);
  console.log(`  📌 API Base:   http://localhost:${PORT}/api/notes`);
  console.log("─────────────────────────────────────────────");
});
