import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import NotesInput from '../components/notes/NotesInput';
import NotesOutput from '../components/notes/NotesOutput';
import AIResponsePanel from '../components/ai/AIResponsePanel';

export default function Dashboard() {
  const [currentText, setCurrentText] = useState('');
  const [notes, setNotes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="flex h-full w-full p-4 gap-6">
      <Sidebar />
      
      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">MindScribe OS</h1>
            <p className="text-textMuted mt-1">AI-Powered Learning Dashboard</p>
          </div>
          <div className="flex gap-4">
            <button className="primary-button px-6 py-2">Sync Data</button>
          </div>
        </motion.header>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left Column: Input & AI */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
            <NotesInput 
              currentText={currentText} 
              setCurrentText={setCurrentText} 
              setNotes={setNotes}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
            <AIResponsePanel currentText={currentText} />
          </div>

          {/* Right Column: Output & Visuals */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
            <NotesOutput notes={notes} />
          </div>
        </div>
      </main>
    </div>
  );
}
