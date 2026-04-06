// Grab the DOM elements once.
const textarea = document.getElementById('note-input');
const button = document.getElementById('generate-btn');
const output = document.getElementById('output');

button.addEventListener('click', () => {
  // Clear previous notes.
  output.innerHTML = '';

  const sentences = textarea.value
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  sentences.forEach((sentence, index) => {
    const p = document.createElement('p');
    p.textContent = `${index + 1}. ${sentence}`;
    output.appendChild(p);
  });
});
