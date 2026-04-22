export function renderFlowchart() {
  const container = document.getElementById("flowchart");

  if (!container || !window.mermaid) {
    return;
  }

  const chart = `
    graph TD
      A[User Input] --> B[Send to Backend]
      B --> C[Core Engine Processing]
      C --> D[Generate Notes & Keywords]
      D --> E[Store in Database]
      E --> F[Display in UI]
  `;

  container.innerHTML = `<div class="mermaid">${chart}</div>`;
  window.mermaid.init(undefined, container.querySelectorAll(".mermaid"));
}
