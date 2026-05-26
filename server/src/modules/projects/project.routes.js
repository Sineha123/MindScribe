import express from "express";
import {
  deleteProject,
  getProjectById,
  getProjects,
  saveProject
} from "./project.service.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const project = await saveProject(req.body);
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const project = await saveProject({ ...req.body, _id: req.params.id });
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.post("/save", async (req, res, next) => {
  try {
    const project = await saveProject(req.body);
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const projects = await getProjects();

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteProject(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully."
    });
  } catch (error) {
    next(error);
  }
});

export default router;
