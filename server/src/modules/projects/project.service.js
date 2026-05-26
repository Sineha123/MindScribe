import mongoose from "mongoose";
import Project from "./project.model.js";

export async function saveProject(data) {
  if (data._id && mongoose.Types.ObjectId.isValid(data._id)) {
    const { _id, ...updateData } = data;
    updateData.updatedAt = Date.now();
    const updatedProject = await Project.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      const error = new Error("Project not found to update.");
      error.statusCode = 404;
      throw error;
    }
    return updatedProject;
  }
  const project = new Project(data);
  return project.save();
}

export async function getProjects() {
  return Project.find().sort({ createdAt: -1 });
}

export async function getProjectById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid project ID.");
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findById(id);

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  return project;
}

export async function deleteProject(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid project ID.");
    error.statusCode = 400;
    throw error;
  }

  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  return project;
}
