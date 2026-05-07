import { motion } from 'framer-motion';

export default function NotesInput({ currentText, setCurrentText, onGenerate, isProcessing }) {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
      
      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
          Knowledge Input
        </h2>
      </div>

      <textarea 
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        placeholder="Paste your text here to begin the synthesis process..."
        className="input-field min-h-[150px] resize-y relative z-10 text-lg leading-relaxed font-light"
      />

      <div className="flex gap-4 mt-2 relative z-10">
        <button 
          onClick={onGenerate}
          disabled={isProcessing || !currentText.trim()}
          className="primary-button px-6 py-3 flex-1 flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <span className="animate-pulse">Synthesizing...</span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
              </svg>
              Generate Insight
            </>
          )}
        </button>
        <button 
          onClick={() => { setCurrentText(''); }}
          className="glass-button px-6 py-3"
        >
          Clear
        </button>
      </div>
    </motion.section>
  );
}
