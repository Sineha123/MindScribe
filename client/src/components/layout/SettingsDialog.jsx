import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Key, X, Check } from 'lucide-react';

export default function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing key
    const existing = localStorage.getItem('geminiApiKey');
    if (existing) setApiKey(existing);

    // Listen for global API error
    const handleError = () => setIsOpen(true);
    window.addEventListener('gemini-api-error', handleError);
    
    // Also listen for a generic open-settings event if needed
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-settings', handleOpen);

    return () => {
      window.removeEventListener('gemini-api-error', handleError);
      window.removeEventListener('open-settings', handleOpen);
    };
  }, []);

  const handleSave = () => {
    localStorage.setItem('geminiApiKey', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors z-40 backdrop-blur-md"
        title="Settings"
      >
        <Settings size={20} className="text-textMuted" />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel p-6 shadow-2xl border-primary/20"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-textMuted hover:text-textMain"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6 text-primary">
                <Settings size={24} />
                <h2 className="text-xl font-bold text-textMain">Settings</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2 flex items-center gap-2">
                    <Key size={16} /> Gemini API Key
                  </label>
                  <p className="text-xs text-textMuted/70 mb-3">
                    Your key is stored locally in your browser. It is required for AI synthesis, summaries, and Q&A.
                  </p>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..." 
                    className="input-field w-full text-sm font-mono tracking-wider"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  >
                    {saved ? <Check size={16} /> : 'Save Key'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
