const AI_API_URL = "http://localhost:3000/api/ai";

export async function requestSummary(text) {
  const response = await fetch(`${AI_API_URL}/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  return response.json();
}

export async function requestExplanation(content) {
  const response = await fetch(`${AI_API_URL}/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  return response.json();
}

export async function requestAnswer(content, question) {
  const response = await fetch(`${AI_API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content, question })
  });

  return response.json();
}
