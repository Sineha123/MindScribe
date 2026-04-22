import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  text: {
    type: String,
    default: ""
  },
  notes: {
    type: Array,
    default: []
  },
  keywords: {
    type: Object,
    default: {}
  },
  summary: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
