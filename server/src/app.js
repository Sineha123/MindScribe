import cors from "cors";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MindScribe API is running",
    version: "1.0.0"
  });
});

app.use("/api/notes", notesRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;
