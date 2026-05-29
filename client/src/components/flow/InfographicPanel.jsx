import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

export default function InfographicPanel({ htmlContent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(83,52,131,0.2) 0%, rgba(26,26,46,0.8) 100%)',
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
        background: 'rgba(83,52,131,0.15)',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #533483, #e94560)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LayoutDashboard size={16} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#e0e0ff' }}>
            Visual Storyboard
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
            AI-generated infographic • Educational overview
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {!htmlContent ? (
          <div style={{
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#555570',
          }}>
            <LayoutDashboard size={40} strokeWidth={1} />
            <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>
              Visual storyboard will appear here after AI Synthesize
            </p>
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.6',
              color: '#e0e0e0',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </motion.div>
  );
}
