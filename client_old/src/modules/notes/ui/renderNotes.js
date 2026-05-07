const notesOutput = document.getElementById("notes-output");

export function renderNotes(notes, activeIndex = -1) {
  notesOutput.innerHTML = "";

  if (!notes || notes.length === 0) {
    notesOutput.innerHTML = '<p class="empty-state">No notes to display yet.</p>';
    return;
  }

  notes.forEach((note, index) => {
    const noteElement = document.createElement("p");
    noteElement.className = "note-item";
    noteElement.dataset.noteIndex = String(index);
    noteElement.textContent = note;

    if (index === activeIndex) {
      noteElement.classList.add("note-item-active");
    }

    notesOutput.appendChild(noteElement);
  });
}
