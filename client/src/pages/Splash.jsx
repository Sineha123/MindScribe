import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to projects after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/projects');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <BrainCircuit size={80} className="text-primary drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </motion.div>
        
        <div className="flex flex-col items-center gap-2">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          >
            MindScribe
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-sm text-textMuted uppercase tracking-[0.3em] font-mono"
          >
            Synthesize your knowledge
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
