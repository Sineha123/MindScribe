import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import NotesInput from '../components/notes/NotesInput';
import NotesOutput from '../components/notes/NotesOutput';
import AIResponsePanel from '../components/ai/AIResponsePanel';
import KeywordCharts from '../components/charts/KeywordCharts';
import FlowchartPanel from '../components/flow/FlowchartPanel';
import ConceptGraph from '../components/graph/ConceptGraph';
import { notesService, projectsService } from '../services/api';

export default function Dashboard() {
  const [currentText, setCurrentText] = useState('');
  const [projectData, setProjectData] = useState({
    notes: [],
    keywords: {},
    flowchart: '',
    graph: { nodes: [], links: [] }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsService.getProjects();
      setSavedProjects(res.data.data || []);
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const handleGenerate = async () => {
    if (!currentText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await notesService.processText(currentText);
      const data = res.data.data;
      
      setProjectData({
        notes: data.notes || [],
        keywords: data.keywords || {},
        flowchart: data.flowchart || '',
        graph: data.graph || { nodes: [], links: [] }
      });
    } catch (err) {
      console.error('Processing failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!currentText.trim()) return;
    try {
      await projectsService.saveProject({
        text: currentText,
        ...projectData
      });
      loadProjects();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="flex h-full w-full p-4 gap-6">
      <Sidebar projects={savedProjects} />
      
      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent font-mono tracking-tighter">MINDSCRIBE_OS_V2</h1>
            <p className="text-textMuted mt-1">Neural Learning & Concept Mapping System</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={!currentText || isProcessing}
              className="primary-button px-6 py-2"
            >
              Commit to DB
            </button>
          </div>
        </motion.header>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <NotesInput 
              currentText={currentText} 
              setCurrentText={setCurrentText} 
              onGenerate={handleGenerate}
              isProcessing={isProcessing}
            />
            <AIResponsePanel currentText={currentText} />
            <FlowchartPanel definition={projectData.flowchart} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <NotesOutput notes={projectData.notes} />
            <KeywordCharts keywords={projectData.keywords} />
            <ConceptGraph data={projectData.graph} />
          </div>
        </div>
      </main>
    </div>
  );
}
