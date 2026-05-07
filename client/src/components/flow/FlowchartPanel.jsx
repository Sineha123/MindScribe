import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#38bdf8',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#818cf8',
    secondaryColor: '#c084fc',
    tertiaryColor: '#1e293b',
  },
});

export default function FlowchartPanel({ definition }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (definition && containerRef.current) {
      containerRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [definition]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-6 overflow-hidden"
    >
      <h3 className="text-lg font-semibold mb-4 text-secondary">Learning Flow</h3>
      <div 
        ref={containerRef} 
        className="mermaid flex justify-center bg-black/20 rounded-xl p-4 min-h-[200px]"
      >
        {definition || 'graph TD\n  A[Start] --> B[Processing]\n  B --> C[Result]'}
      </div>
    </motion.div>
  );
}
