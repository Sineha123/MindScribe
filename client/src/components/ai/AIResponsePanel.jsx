import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/api';
import {
  BrainCircuit, HelpCircle, FileText, Check,
  Cpu, Cloud, Database, ChevronDown, Zap
} from 'lucide-react';

const PROVIDER_ICONS = {
  gemini: <Cloud size={12} />,
  ollama: <Cpu size={12} />,
};

export default function AIResponsePanel({ currentText, language = 'English', setLanguage, onInsert }) {
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [question, setQuestion] = useState('');
  const [level, setLevel] = useState('beginner');

  // LLM Provider state
  const [provider, setProvider] = useState(() => localStorage.getItem('llmProvider') || 'gemini');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('ollamaModel') || 'llama3.2');
  const [providerData, setProviderData] = useState(null);
  const [ragChunksUsed, setRagChunksUsed] = useState(0);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  // Load provider info on mount
  useEffect(() => {
    aiService.getProviders()
      .then(res => setProviderData(res.data.data))
      .catch(() => {});
  }, []);

  // Persist provider choice
  useEffect(() => {
    localStorage.setItem('llmProvider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('ollamaModel', ollamaModel);
  }, [ollamaModel]);

  const handleAIAction = async (type) => {
    if (!currentText.replace(/<[^>]*>?/gm, '').trim()) return;
    setIsThinking(true);
    setRagChunksUsed(0);

    try {
      let res;
      const opts = { provider, ollamaModel };

      if (type === 'summary') res = await aiService.generateSummary(currentText, 'concise', language, opts);
      if (type === 'explain') res = await aiService.explainContent(currentText, level, language, opts);
      if (type === 'ask') {
        res = await aiService.askQuestion(currentText, question, language, undefined, opts);
        // Show RAG badge — estimate chunks from doc length
        const wordCount = currentText.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
        setRagChunksUsed(Math.min(4, Math.max(1, Math.floor(wordCount / 375))));
      }

      setResponse(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'AI request failed.';
      setResponse(`<p style="color:#e94560">⚠️ ${msg}</p>`);
    } finally {
      setIsThinking(false);
    }
  };

  const ollamaProviderInfo = providerData?.providers?.find(p => p.id === 'ollama');
  const geminiProviderInfo = providerData?.providers?.find(p => p.id === 'gemini');
  const activeInfo = provider === 'ollama' ? ollamaProviderInfo : geminiProviderInfo;

  return (
    <div className="flex flex-col gap-4">
      {/* LLM Provider Selector */}
      <section className="glass-panel p-3 border-accent/20 relative" style={{ borderColor: 'rgba(83,52,131,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#8888aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🤖 LLM Provider
          </span>
          {ragChunksUsed > 0 && (
            <span style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '999px',
              background: 'rgba(15,52,96,0.5)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Database size={9} /> {ragChunksUsed} RAG chunks
            </span>
          )}
        </div>

        {/* Provider Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          {[
            { id: 'gemini', label: 'Gemini', icon: <Cloud size={11} />, status: geminiProviderInfo?.status },
            { id: 'ollama', label: 'Ollama', icon: <Cpu size={11} />, status: ollamaProviderInfo?.status },
          ].map(p => (
            <button key={p.id} onClick={() => setProvider(p.id)}
              style={{
                flex: 1, padding: '6px 8px', borderRadius: '7px', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                background: provider === p.id
                  ? 'linear-gradient(135deg, #0f3460, #533483)'
                  : 'transparent',
                color: provider === p.id ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: provider === p.id ? '0 0 10px rgba(83,52,131,0.4)' : 'none',
              }}
            >
              {p.icon} {p.label}
              {p.status === 'online' && (
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
              )}
              {p.status === 'offline' && (
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f87171' }} />
              )}
            </button>
          ))}
        </div>

        {/* Ollama model selector */}
        {provider === 'ollama' && (
          <div style={{ marginTop: '8px' }}>
            {ollamaProviderInfo?.status === 'offline' ? (
              <div style={{
                padding: '8px 10px', borderRadius: '8px', fontSize: '11px',
                background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560',
              }}>
                🔴 Ollama offline — install from <strong>ollama.com</strong> then:<br />
                <code style={{ fontSize: '10px', color: '#fbbf24' }}>ollama serve && ollama pull llama3.2</code>
              </div>
            ) : (
              <select
                value={ollamaModel}
                onChange={e => setOllamaModel(e.target.value)}
                style={{
                  width: '100%', padding: '6px 8px', borderRadius: '7px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(83,52,131,0.4)',
                  color: '#e0e0ff', fontSize: '11px', outline: 'none',
                }}
              >
                {ollamaProviderInfo?.models?.length > 0 ? (
                  ollamaProviderInfo.models.map(m => (
                    <option key={m.name} value={m.name}>{m.name} ({m.size})</option>
                  ))
                ) : (
                  <option value="llama3.2">llama3.2 (default)</option>
                )}
              </select>
            )}
          </div>
        )}

        {/* Active model badge */}
        {activeInfo && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={10} style={{ color: '#8888aa' }} />
            <span style={{ fontSize: '10px', color: '#666688' }}>
              {provider === 'ollama' ? ollamaModel : 'gemini-2.5-flash'}
            </span>
          </div>
        )}
      </section>

      {/* AI Controls */}
      <section className="glass-panel p-4 flex flex-col gap-4 border-accent/20">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold flex items-center gap-2 text-accent">
            <BrainCircuit size={18} />
            Knowledge Engine
          </h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-textMuted focus:outline-none"
          >
            <option value="English">English</option>
            <option value="Roman Hindi">Roman Hindi</option>
            <option value="Urdu">Urdu</option>
            <option value="Arabic">Arabic</option>
            <option value="French">French</option>
          </select>
        </div>

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
            onKeyDown={(e) => e.key === 'Enter' && handleAIAction('ask')}
            placeholder="Ask AI anything about your notes..."
            className="input-field w-full text-xs pr-10"
          />
          <button
            onClick={() => handleAIAction('ask')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* RAG info badge */}
        <div style={{
          padding: '6px 10px', borderRadius: '8px', fontSize: '10px',
          background: 'rgba(15,52,96,0.2)', border: '1px solid rgba(15,52,96,0.3)',
          color: '#6677aa', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Database size={10} />
          BM25 RAG · MCP Context · Session Memory
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
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.2em]">
                  {provider === 'ollama' ? `Running ${ollamaModel}...` : 'Gemini Processing...'}
                </span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {response ? (
              <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div
                  className="prose prose-invert prose-xs text-textMain/80 leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: response }}
                />
                <div className="mt-4 flex justify-end sticky bottom-0 bg-gradient-to-t from-background to-transparent pt-4">
                  <button
                    onClick={() => { if (onInsert) onInsert(response); }}
                    className="glass-button px-3 py-1.5 text-xs text-primary hover:text-white border-primary/30 hover:bg-primary/20 flex items-center gap-1 shadow-lg"
                  >
                    <Check size={14} /> Insert to Document
                  </button>
                </div>
              </motion.div>
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
