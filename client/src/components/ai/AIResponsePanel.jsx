import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/api';
import { Brain, HelpCircle, FileText, ChevronDown } from 'lucide-react';

export default function AIResponsePanel({ currentText }) {
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [question, setQuestion] = useState('');
  const [level, setLevel] = useState('beginner');

  const handleAIAction = async (type) => {
    if (!currentText.replace(/<[^>]*>?/gm, '').trim()) return;
    setIsThinking(true);
    try {
      let res;
      if (type === 'summary') res = await aiService.generateSummary(currentText);
      if (type === 'explain') res = await aiService.explainContent(currentText, level);
      if (type === 'ask') res = await aiService.askQuestion(currentText, question);
      
      setResponse(res.data.data);
    } catch (err) {
      setResponse('Failed to get AI response. Please check your connection.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* AI Controls */}
      <section className="glass-panel p-4 flex flex-col gap-4 border-accent/20">
        <h2 className="text-md font-semibold flex items-center gap-2 text-accent">
          <Brain size={18} />
          Knowledge Engine
        </h2>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => handleAIAction('summary')} 
            disabled={isThinking}
            className="glass-button w-full py-2 text-sm flex items-center justify-center gap-2 hover:border-primary/50"
          >
            <FileText size={14} />
            Generate Summary
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleAIAction('explain')} 
              disabled={isThinking}
              className="glass-button flex-1 py-2 text-sm hover:border-accent/50"
            >
              Explain Concept
            </button>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 text-xs text-textMuted focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermed.</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AI anything..." 
            className="input-field w-full text-xs pr-10"
          />
          <button 
            onClick={() => handleAIAction('ask')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </section>

      {/* AI Response Output */}
      <section className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[300px]">
        <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <span className="text-xs font-mono text-textMuted uppercase tracking-wider">AI_RESPONSE_STREAM</span>
          {isThinking && <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
          {isThinking && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.2em]">Processing...</span>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {response ? (
              <motion.div 
                key="response"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert prose-xs text-textMain/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: response }}
              />
            ) : (
              <div className="h-full flex items-center justify-center opacity-20 italic text-sm">
                Awaiting instruction...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
