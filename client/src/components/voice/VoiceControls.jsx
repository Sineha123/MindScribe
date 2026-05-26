import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2, Settings } from 'lucide-react';

export default function VoiceControls({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  // Load available system voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for english and local voices for maximum quality
      const filtered = allVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('ur') || v.default);
      setVoices(filtered);
      
      if (filtered.length > 0 && !selectedVoice) {
        // Find default or first english voice
        const def = filtered.find(v => v.default) || filtered.find(v => v.lang.startsWith('en')) || filtered[0];
        setSelectedVoice(def.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    if (!text) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    // Cancel any active speaking
    window.speechSynthesis.cancel();

    // Clean up HTML tags for reading
    const cleanText = text.replace(/<[^>]*>?/gm, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    
    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-1.5 backdrop-blur-md shadow-lg">
      <Volume2 size={16} className="text-primary animate-pulse" />
      <span className="text-[10px] uppercase tracking-wider font-semibold font-mono text-textMuted hidden sm:inline">Notes Narrator</span>
      
      <div className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5">
        {!isSpeaking || isPaused ? (
          <button 
            onClick={speak}
            className="p-1.5 hover:bg-white/10 rounded-lg text-primary hover:text-white transition-all cursor-pointer"
            title="Read Notes"
          >
            <Play size={14} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={pause}
            className="p-1.5 hover:bg-white/10 rounded-lg text-accent hover:text-white transition-all cursor-pointer"
            title="Pause Reading"
          >
            <Pause size={14} fill="currentColor" />
          </button>
        )}
        
        <button 
          onClick={stop}
          className="p-1.5 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
          title="Stop Reading"
        >
          <Square size={14} fill="currentColor" />
        </button>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Playback speed selector */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-mono text-textMuted font-medium">Speed:</span>
        <select 
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="bg-transparent border border-white/5 rounded px-1 py-0.5 text-[10px] text-textMain focus:outline-none cursor-pointer hover:bg-white/5"
        >
          <option value="0.5" className="bg-background">0.5x</option>
          <option value="0.8" className="bg-background">0.8x</option>
          <option value="1" className="bg-background">1.0x</option>
          <option value="1.25" className="bg-background">1.25x</option>
          <option value="1.5" className="bg-background">1.5x</option>
          <option value="2" className="bg-background">2.0x</option>
        </select>
      </div>

      {/* Voice selection (if multiple voices are loaded) */}
      {voices.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5">
          <div className="h-4 w-px bg-white/10" />
          <Settings size={10} className="text-textMuted" />
          <select 
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-transparent border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-textMain max-w-[120px] focus:outline-none cursor-pointer hover:bg-white/5 truncate"
          >
            {voices.map(voice => (
              <option key={voice.name} value={voice.name} className="bg-background text-xs">
                {voice.name.replace('Google', '').replace('Microsoft', '').trim()}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
