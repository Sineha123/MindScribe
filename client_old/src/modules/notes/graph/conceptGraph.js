import { extractLinks, extractNodes, removeDuplicateLinks } from "./graphUtils.js";

export function renderConceptGraph(data) {
  const svg = window.d3.select("#graph");

  if (svg.empty() || !window.d3) {
    return;
  }

  svg.selectAll("*").remove();

  const nodes = extractNodes(data?.keywords || {});

  if (nodes.length === 0) {
    svg
      .append("text")
      .attr("x", 24)
      .attr("y", 40)
      .attr("fill", "#6e5a47")
      .style("font-size", "16px")
      .text("No concept graph data available yet.");
    return;
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = removeDuplicateLinks(extractLinks(data?.sentences || [], data?.keywords || {}))
    .filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

  const width = Number(svg.attr("width")) || 800;
  const height = Number(svg.attr("height")) || 500;

  const container = svg.append("g");
  const tooltip = window.d3
    .select("body")
    .selectAll(".graph-tooltip")
    .data([null])
    .join("div")
    .attr("class", "graph-tooltip")
    .style("opacity", 0);

  const simulation = window.d3.forceSimulation(nodes)
    .force("link", window.d3.forceLink(links).id((d) => d.id).distance((link) => {
      const sourceWeight = typeof link.source === "object" ? link.source.weight : 1;
      const targetWeight = typeof link.target === "object" ? link.target.weight : 1;
      return Math.max(70, 160 - (sourceWeight + targetWeight) * 4);
    }))
    .force("charge", window.d3.forceManyBody().strength(-220))
    .force("center", window.d3.forceCenter(width / 2, height / 2));

  const linkSelection = container
    .append("g")
    .attr("stroke", "rgba(95, 62, 33, 0.28)")
    .attr("stroke-width", 1.25)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", "graph-link");

  const nodeSelection = container
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("class", "graph-node")
    .attr("r", (d) => 5 + d.weight * 2)
    .attr("fill", "#c4672d")
    .call(
      window.d3.drag()
        .on("start", (event, node) => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }
          node.fx = node.x;
          node.fy = node.y;
        })
        .on("drag", (event, node) => {
          node.fx = event.x;
          node.fy = event.y;
        })
        .on("end", (event, node) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          node.fx = null;
          node.fy = null;
        })
    );

  const labelSelection = container
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("class", "graph-label")
    .attr("fill", "#2f2419")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .text((d) => d.id);

  function isConnected(nodeA, nodeB) {
    return links.some((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;

      return (
        (sourceId === nodeA.id && targetId === nodeB.id) ||
        (sourceId === nodeB.id && targetId === nodeA.id)
      );
    });
  }

  nodeSelection
    .on("mouseenter", (event, hoveredNode) => {
      nodeSelection
        .attr("fill", (node) => (node.id === hoveredNode.id || isConnected(node, hoveredNode) ? "#2d7b57" : "rgba(196, 103, 45, 0.22)"))
        .attr("opacity", (node) => (node.id === hoveredNode.id || isConnected(node, hoveredNode) ? 1 : 0.3));

      labelSelection
        .attr("opacity", (node) => (node.id === hoveredNode.id || isConnected(node, hoveredNode) ? 1 : 0.25));

      linkSelection
        .attr("stroke", (link) => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          return sourceId === hoveredNode.id || targetId === hoveredNode.id ? "#2d7b57" : "rgba(95, 62, 33, 0.12)";
        })
        .attr("stroke-opacity", (link) => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          return sourceId === hoveredNode.id || targetId === hoveredNode.id ? 1 : 0.18;
        })
        .attr("stroke-width", (link) => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          return sourceId === hoveredNode.id || targetId === hoveredNode.id ? 2.4 : 1;
        });

      tooltip
        .style("opacity", 1)
        .html(`<strong>${hoveredNode.id}</strong><br>Frequency: ${hoveredNode.weight}`)
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", () => {
      nodeSelection.attr("fill", "#c4672d").attr("opacity", 1);
      labelSelection.attr("opacity", 1);
      linkSelection
        .attr("stroke", "rgba(95, 62, 33, 0.28)")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1.25);

      tooltip.style("opacity", 0);
    });

  simulation.on("tick", () => {
    linkSelection
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    nodeSelection
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    labelSelection
      .attr("x", (d) => d.x + 10)
      .attr("y", (d) => d.y + 4);
  });
}
