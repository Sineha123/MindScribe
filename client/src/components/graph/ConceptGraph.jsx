import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { Share2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const GROUP_COLORS = {
  1: { fill: '#e94560', glow: 'rgba(233,69,96,0.5)', label: 'Core Concept' },
  2: { fill: '#533483', glow: 'rgba(83,52,131,0.5)', label: 'Sub-Concept' },
  3: { fill: '#0f3460', glow: 'rgba(15,52,96,0.5)', label: 'Detail' },
};

export default function ConceptGraph({ data }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const simulationRef = useRef(null);
  const zoomRef = useRef(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    const nodes = data.nodes.map(n => ({ ...n }));
    const links = data.links.map(l => ({ ...l }));

    setNodeCount(nodes.length);
    setLinkCount(links.length);

    const container = svgRef.current.parentElement;
    const width = container.clientWidth || 800;
    const height = 460;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Defs for glow filters & arrowheads
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrowhead markers per group
    Object.entries(GROUP_COLORS).forEach(([group, colors]) => {
      defs.append('marker')
        .attr('id', `arrow-${group}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', colors.fill)
        .attr('opacity', 0.7);
    });

    // Background grid
    const grid = svg.append('g').attr('class', 'grid');
    for (let x = 0; x < width; x += 40) {
      grid.append('line')
        .attr('x1', x).attr('y1', 0).attr('x2', x).attr('y2', height)
        .attr('stroke', 'rgba(255,255,255,0.03)').attr('stroke-width', 1);
    }
    for (let y = 0; y < height; y += 40) {
      grid.append('line')
        .attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y)
        .attr('stroke', 'rgba(255,255,255,0.03)').attr('stroke-width', 1);
    }

    // Main group for zoom/pan
    const g = svg.append('g');
    gRef.current = g;

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const sourceGroup = typeof d.source === 'object' ? d.source.group : 1;
        return sourceGroup === 1 ? 120 : 90;
      }).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d.size || 10) + 20));

    simulationRef.current = simulation;

    // Link lines
    const link = g.append('g').attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const group = sourceNode?.group || 2;
        return GROUP_COLORS[group]?.fill || '#533483';
      })
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 2');

    // Link labels
    const linkLabels = g.append('g').attr('class', 'link-labels')
      .selectAll('text')
      .data(links.filter(l => l.label))
      .join('text')
      .attr('font-size', '9px')
      .attr('fill', 'rgba(200,200,220,0.6)')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.label || '');

    // Node groups
    const node = g.append('g').attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'grab')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
          d3.select(event.sourceEvent.target.closest('g')).attr('cursor', 'grabbing');
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
          d3.select(event.sourceEvent.target.closest('g')).attr('cursor', 'grab');
        })
      );

    // Outer glow ring
    node.append('circle')
      .attr('r', d => (d.size || 10) + 6)
      .attr('fill', d => GROUP_COLORS[d.group]?.glow || 'rgba(83,52,131,0.3)')
      .attr('stroke', 'none')
      .style('filter', 'url(#glow)');

    // Main circle
    node.append('circle')
      .attr('r', d => d.size || 10)
      .attr('fill', d => GROUP_COLORS[d.group]?.fill || '#533483')
      .attr('stroke', d => {
        const c = GROUP_COLORS[d.group];
        return c ? c.fill : '#533483';
      })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8);

    // Node label background pill
    node.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(26,26,46,0.85)')
      .attr('stroke', d => GROUP_COLORS[d.group]?.fill || '#533483')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.5)
      .each(function(d) {
        const text = d.id;
        const estimatedWidth = Math.min(text.length * 7 + 12, 120);
        d3.select(this)
          .attr('width', estimatedWidth)
          .attr('height', 18)
          .attr('x', (d.size || 10) + 4)
          .attr('y', -9);
      });

    // Node text labels
    node.append('text')
      .text(d => d.id.length > 16 ? d.id.substring(0, 14) + '…' : d.id)
      .attr('x', d => (d.size || 10) + 10)
      .attr('y', 4)
      .attr('fill', '#e0e0ff')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif')
      .attr('pointer-events', 'none');

    // Tooltip on hover
    node.on('mouseenter', (event, d) => {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        text: d.id,
        group: d.group,
      });
    }).on('mouseleave', () => {
      setTooltip({ visible: false });
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 4);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data]);

  const handleZoom = (factor) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(
      zoomRef.current.scaleBy, factor
    );
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(
      zoomRef.current.transform, d3.zoomIdentity
    );
  };

  const isEmpty = !data || !data.nodes || data.nodes.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(15,52,96,0.2) 100%)',
        border: '1px solid rgba(83,52,131,0.4)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(83,52,131,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(15,52,96,0.15)',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #e94560, #533483)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Share2 size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#e0e0ff' }}>
            Knowledge Graph
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
            {isEmpty ? 'Drag nodes • Scroll to zoom' : `${nodeCount} concepts • ${linkCount} connections • Drag nodes • Scroll to zoom`}
          </p>
        </div>

        {/* Legend */}
        {!isEmpty && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {Object.entries(GROUP_COLORS).map(([g, c]) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.fill }} />
                <span style={{ fontSize: '10px', color: '#8888aa' }}>{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {!isEmpty && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {[
              { icon: <ZoomIn size={13} />, action: () => handleZoom(1.3), title: 'Zoom in' },
              { icon: <ZoomOut size={13} />, action: () => handleZoom(0.7), title: 'Zoom out' },
              { icon: <RefreshCw size={13} />, action: handleReset, title: 'Reset view' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.title} style={{
                width: '28px', height: '28px',
                background: 'rgba(83,52,131,0.3)',
                border: '1px solid rgba(83,52,131,0.4)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a0a0c0',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(83,52,131,0.6)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(83,52,131,0.3)'}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Graph Canvas */}
      <div style={{ position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
        {isEmpty ? (
          <div style={{
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#555570',
          }}>
            <Share2 size={40} strokeWidth={1} />
            <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>
              Knowledge graph will appear here after AI Synthesize
            </p>
          </div>
        ) : (
          <svg ref={svgRef} style={{ width: '100%', display: 'block', cursor: 'grab' }} />
        )}

        {/* Tooltip */}
        {tooltip.visible && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            background: 'rgba(26,26,46,0.95)',
            border: `1px solid ${GROUP_COLORS[tooltip.group]?.fill || '#533483'}`,
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#e0e0ff',
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}
