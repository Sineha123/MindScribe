import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Untitled Project"
  },
  text: {
    type: String,
    default: ""
  },
  editorContent: {
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
  infographicHtml: {
    type: String,
    default: ""
  },
  flowchart: {
    type: String,
    default: ""
  },
  graph: {
    type: Object,
    default: { nodes: [], links: [] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
projectSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
