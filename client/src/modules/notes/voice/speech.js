const synth = window.speechSynthesis;

let currentIndex = 0;
let activeNotes = [];
let highlightCallback = null;

function speakCurrentNote() {
  if (currentIndex >= activeNotes.length) {
    highlightCallback?.(-1);
    currentIndex = 0;
    activeNotes = [];
    return;
  }

  const utterance = new SpeechSynthesisUtterance(activeNotes[currentIndex]);

  utterance.onstart = () => {
    highlightCallback?.(currentIndex);
  };

  utterance.onend = () => {
    currentIndex += 1;
    speakCurrentNote();
  };

  utterance.onerror = () => {
    highlightCallback?.(-1);
    currentIndex = 0;
    activeNotes = [];
  };

  synth.speak(utterance);
}

export function speakNotes(notes, onHighlight) {
  stopSpeech();

  if (!Array.isArray(notes) || notes.length === 0) {
    onHighlight?.(-1);
    return;
  }

  activeNotes = notes.filter((note) => typeof note === "string" && note.trim());
  highlightCallback = onHighlight;
  currentIndex = 0;

  if (activeNotes.length === 0) {
    highlightCallback?.(-1);
    return;
  }

  speakCurrentNote();
}

export function pauseSpeech() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  }
}

export function resumeSpeech() {
  if (synth.paused) {
    synth.resume();
  }
}

export function stopSpeech() {
  synth.cancel();
  currentIndex = 0;
  activeNotes = [];
  highlightCallback?.(-1);
}
