const NOTES_API_URL = "http://localhost:3000/api/notes/process-text";

export async function processText(text) {
  const response = await fetch(NOTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  return response.json();
}
