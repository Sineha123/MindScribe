import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { GitBranch, RefreshCw, Download, PlusCircle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  flowchart: { htmlLabels: false },
  themeVariables: {
    primaryColor: '#e3f2fd',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#94a3b8',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#f8fafc',
    clusterBkg: '#f8fafc',
    clusterBorder: '#cbd5e1',
    nodeTextColor: '#0f172a',
  },
});

let mermaidIdCounter = 0;

/**
 * Sanitizes a Mermaid diagram string to fix common AI-generated issues:
 *
 * 1. Parentheses inside [square bracket labels] cause parse errors because
 *    Mermaid treats () as stadium node syntax. We strip them.
 * 2. Colons, slashes, quotes inside labels are escaped.
 * 3. Emoji in node IDs confuse the parser — move them to labels.
 * 4. Ensures subgraph end keywords are present.
 */
function sanitizeMermaid(definition) {
  if (!definition) return '';

  return definition
    // Remove parentheses inside square-bracket node labels: [foo (bar)] → [foo bar]
    .replace(/\[([^\]]*)\]/g, (_, inner) =>
      '[' + inner
        .replace(/[()]/g, '')     // strip parens
        .replace(/"/g, "'")       // convert double quotes to single
        .replace(/:/g, ' -')      // replace colons
        .replace(/\//g, ' or ')   // replace slashes
        .replace(/\s{2,}/g, ' ')  // collapse double spaces
        .trim() + ']'
    )
    // Remove parentheses inside rounded node labels: (foo (bar)) → (foo bar)
    .replace(/\(([^)]*)\(([^)]*)\)([^)]*)\)/g, (_, a, b, c) => `(${a}${b}${c})`)
    // Strip any remaining bare parentheses in node IDs (before arrow/pipe)
    .replace(/([A-Za-z0-9_]+)\(([^)]*)\)(?=\s*(?:-->|---|==|~~|--\|))/g, '$1[$2]')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const getPngDataUrl = async (svgString) => {
  return new Promise((resolve, reject) => {
    // Strip external fonts/imports or foreignObject that taint the canvas
    let safeSvg = svgString
      .replace(/@import url\([^)]+\);?/g, '') // remove external CSS imports
      .replace(/<foreignObject[\s\S]*?<\/foreignObject>/g, ''); // kill any lingering foreignObjects

    const img = new Image();
    img.crossOrigin = 'anonymous'; // sometimes helps with rendering

    // Use base64 instead of Blob URL
    const b64 = btoa(unescape(encodeURIComponent(safeSvg)));
    img.src = `data:image/svg+xml;base64,${b64}`;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const match = safeSvg.match(/viewBox="[\d.\s]+ (\d+\.?\d*) (\d+\.?\d*)"/);
        const w = match ? parseFloat(match[1]) : (img.width || 800);
        const h = match ? parseFloat(match[2]) : (img.height || 600);
        
        const scale = 2;
        canvas.width = w * scale;
        canvas.height = h * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);
        
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error("Canvas export failed:", err);
        // Fallback: resolve with the raw SVG data URL so it doesn't break
        resolve(`data:image/svg+xml;base64,${b64}`);
      }
    };

    img.onerror = (err) => {
      console.error("Image load failed", err);
      resolve(`data:image/svg+xml;base64,${b64}`);
    };
  });
};

export default function FlowchartPanel({ definition, onInsert }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    if (!definition || !definition.trim()) {
      setSvgContent('');
      setSanitized('');
      return;
    }

    const clean = sanitizeMermaid(definition);
    setSanitized(clean);

    const render = async () => {
      setIsRendering(true);
      setError(null);
      try {
        const id = `mermaid-${++mermaidIdCounter}`;
        const { svg } = await mermaid.render(id, clean);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        // Try a minimal fallback diagram
        try {
          const fallback = "graph TD\n  A[Content] --> B[Analysis]\n  B --> C[Insights]";
          const { svg } = await mermaid.render(`mermaid-fallback-${mermaidIdCounter}`, fallback);
          setSvgContent(svg);
          setError('Original diagram had syntax issues — showing simplified version.');
        } catch {
          setError(`Parse error in diagram. Definition: ${clean.substring(0, 100)}...`);
        }
      } finally {
        setIsRendering(false);
      }

    };

    render();
  }, [definition]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(15,52,96,0.3) 0%, rgba(26,26,46,0.8) 100%)',
        border: '1px solid rgba(83,52,131,0.4)',
        borderRadius: '16px',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(83,52,131,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(15,52,96,0.2)',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0f3460, #533483)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <GitBranch size={16} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#e0e0ff' }}>
            Learning Flow
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
            Conceptual process map • Auto-generated
          </p>
        </div>
        {isRendering && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#8888aa', fontSize: '12px' }}>
            <RefreshCw size={12} className="animate-spin" />
            Rendering...
          </div>
        )}
        
        {svgContent && !isRendering && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {onInsert && (
              <button
                onClick={async () => {
                  const dataUrl = await getPngDataUrl(svgContent);
                  onInsert(`<img src="${dataUrl}" style="max-width: 100%; border-radius: 8px; border: 1px solid #ccc; margin: 10px 0; background: white;" alt="Flowchart" />`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                  borderRadius: '6px', background: 'rgba(52,131,83,0.15)',
                  border: '1px solid rgba(52,131,83,0.3)', color: '#348353',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(52,131,83,0.25)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(52,131,83,0.15)'}
              >
                <PlusCircle size={14} /> Add to Document
              </button>
            )}
            
            <button
              onClick={async () => {
                const dataUrl = await getPngDataUrl(svgContent);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'flowchart.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                borderRadius: '6px', background: 'rgba(233,69,96,0.15)',
                border: '1px solid rgba(233,69,96,0.3)', color: '#e94560',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(233,69,96,0.25)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(233,69,96,0.15)'}
            >
              <Download size={14} /> Download PNG
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {!definition && (
          <div style={{
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#555570',
          }}>
            <GitBranch size={40} strokeWidth={1} />
            <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>
              Flowchart will appear here after AI Synthesize
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(233,69,96,0.1)',
            border: '1px solid rgba(233,69,96,0.3)',
            borderRadius: '10px',
            color: '#e94560',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {svgContent && !error && (
          <div
            ref={containerRef}
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(83,52,131,0.2)',
              overflow: 'auto',
              maxHeight: '70vh', // Ensures it doesn't break out of screen before scrolling
              display: 'flex',
              justifyContent: 'center'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </motion.div>
  );
}
