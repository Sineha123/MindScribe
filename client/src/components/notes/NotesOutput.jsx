import { motion, AnimatePresence } from 'framer-motion';
import VoiceControls from '../voice/VoiceControls';

export default function NotesOutput({ notes }) {
  const fullText = notes.map(n => n.text).join('. ');

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-6 flex flex-col gap-4 min-h-[300px]"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-secondary">
          <span className="w-1.5 h-6 bg-secondary rounded-full inline-block"></span>
          Synthesized Knowledge
        </h2>
        <VoiceControls text={fullText} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 max-h-[400px]">
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-textMuted/50 gap-4 py-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="font-mono text-xs uppercase tracking-widest">System idle: Awaiting input</p>
            </motion.div>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border-l-2 border-l-secondary/30"
              >
                <div className="flex gap-3">
                  <span className="text-secondary font-bold font-mono text-xs opacity-50 mt-1">
                    [{(index + 1).toString().padStart(2, '0')}]
                  </span>
                  <p className="text-textMain/90 leading-relaxed text-sm">{note.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
