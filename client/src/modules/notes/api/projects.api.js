const PROJECTS_API_URL = "http://localhost:3000/api/projects";

export async function getProjects() {
  const response = await fetch(PROJECTS_API_URL);
  return response.json();
}

export async function saveProject(data) {
  const response = await fetch(`${PROJECTS_API_URL}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export async function deleteProject(id) {
  const response = await fetch(`${PROJECTS_API_URL}/${id}`, {
    method: "DELETE"
  });

  return response.json();
}
