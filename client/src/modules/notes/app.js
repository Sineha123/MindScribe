// Grab the DOM elements once.
const textarea = document.getElementById('note-input');
const generateButton = document.getElementById('generate-btn');
const clearButton = document.getElementById('clear-btn');
const output = document.getElementById('output');

/**
 * Clean and split raw text into sentences.
 */
function cleanSentences(text) {
  return text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Fetch posts from the placeholder API.
 */
async function fetchPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!response.ok) {
    throw new Error('Could not fetch notes right now. Please try again.');
  }
  return response.json();
}

/**
 * Fetch posts and convert their titles into cleaned sentences.
 */
async function fetchNotes() {
  const posts = await fetchPosts();
  const titles = posts.slice(0, 5).map((item) => item.title);
  const combined = titles.join('. ');
  return cleanSentences(combined);
}

function showMessage(message, type = 'status') {
  output.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = message;
  p.className = type;
  output.appendChild(p);
}

function renderNotes(sentences) {
  output.innerHTML = '';

  const status = document.createElement('p');
  status.textContent = 'Success! Notes ready.';
  status.className = 'success';
  output.appendChild(status);

  sentences.forEach((sentence, index) => {
    const p = document.createElement('p');
    p.textContent = `${index + 1}. ${sentence}`;
    output.appendChild(p);
  });
}

async function handleGenerateClick() {
  const text = textarea.value.trim();
  generateButton.disabled = true;
  showMessage('Processing...', 'status');

  try {
    const sentences = text.length > 0 ? cleanSentences(text) : await fetchNotes();

    if (sentences.length === 0) {
      showMessage('No notes to display.', 'status');
    } else {
      renderNotes(sentences);
    }
  } catch (error) {
    showMessage(error.message || error, 'error');
  } finally {
    generateButton.disabled = false;
  }
}

function handleClear() {
  textarea.value = '';
  output.innerHTML = '';
}

generateButton.addEventListener('click', handleGenerateClick);
clearButton.addEventListener('click', handleClear);
