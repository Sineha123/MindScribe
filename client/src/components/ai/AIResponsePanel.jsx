import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIResponsePanel({ currentText }) {
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [question, setQuestion] = useState('');

  const simulateAI = (type) => {
    if (!currentText.trim() && type !== 'ask') return;
    setIsThinking(true);
    setTimeout(() => {
      if (type === 'summary') setResponse("AI Summary: The text discusses the integration of artificial intelligence in educational technologies, focusing on creating dynamic, interactive, and personalized learning environments using advanced web frameworks.");
      if (type === 'explain') setResponse("AI Explanation: Imagine a smart notebook that not only stores your writing but reads it, understands it, and helps you learn it better. That's what an AI-powered learning dashboard does.");
      if (type === 'ask') setResponse(`Answer: Based on your context, the answer to "${question}" involves leveraging machine learning algorithms to parse text and render interactive 3D visualizations.`);
      setIsThinking(false);
    }, 2000);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-panel p-6 flex flex-col gap-5 border border-accent/30"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-accent">
          <span className="w-1.5 h-6 bg-accent rounded-full inline-block"></span>
          AI Assistant
        </h2>
      </div>

      <div className="flex gap-3">
        <button onClick={() => simulateAI('summary')} disabled={isThinking || !currentText} className="glass-button flex-1 py-2 text-sm">Summarize</button>
        <button onClick={() => simulateAI('explain')} disabled={isThinking || !currentText} className="glass-button flex-1 py-2 text-sm">Explain Simple</button>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..." 
          className="input-field flex-1 text-sm py-2"
        />
        <button 
          onClick={() => simulateAI('ask')} 
          disabled={isThinking || !question} 
          className="primary-button px-4 py-2 text-sm"
        >
          Ask
        </button>
      </div>

      <div className="min-h-[120px] bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden">
        {isThinking && (
          <div className="absolute inset-0 bg-accent/5 flex items-center justify-center">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!isThinking && response && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-textMain/90 text-sm leading-relaxed"
            >
              {response}
            </motion.p>
          )}
          {!isThinking && !response && (
            <p className="text-textMuted text-sm italic">AI answers will materialize here...</p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
