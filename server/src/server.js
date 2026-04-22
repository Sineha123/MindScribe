import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("MindScribe Server");
      console.log(`Running on: http://localhost:${PORT}`);
      console.log(`Notes API: http://localhost:${PORT}/api/notes`);
      console.log(`Projects API: http://localhost:${PORT}/api/projects`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
