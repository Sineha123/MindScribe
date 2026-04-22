const projectsList = document.getElementById("projects-list");

export function renderProjects(projects) {
  projectsList.innerHTML = "";

  if (!projects || projects.length === 0) {
    projectsList.innerHTML = '<p class="empty-state">No saved projects yet.</p>';
    return;
  }

  projects.forEach((project) => {
    const projectItem = document.createElement("article");
    projectItem.className = "project-item";
    projectItem.dataset.project = JSON.stringify(project);
    projectItem.tabIndex = 0;

    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "project-preview";
    preview.textContent = `${(project.text || "Untitled project").slice(0, 50)}${(project.text || "").length > 50 ? "..." : ""}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-project-btn";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.deleteProject = project._id;
    deleteButton.dataset.projectText = project.text || "";

    projectItem.appendChild(preview);
    projectItem.appendChild(deleteButton);
    projectsList.appendChild(projectItem);
  });
}
