import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import RichEditor from '../components/editor/RichEditor';
import AIResponsePanel from '../components/ai/AIResponsePanel';
import KeywordCharts from '../components/charts/KeywordCharts';
import FlowchartPanel from '../components/flow/FlowchartPanel';
import ConceptGraph from '../components/graph/ConceptGraph';
import VoiceControls from '../components/voice/VoiceControls';
import { aiService, uploadService, exportService, projectsService } from '../services/api';
import { exportToPdf } from '../utils/exportUtils';
import { Upload, Download, FileText, Sparkles, Save, Check, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, unsaved, saving
  
  const [projectData, setProjectData] = useState({
    keywords: {},
    flowchart: '',
    graph: { nodes: [], links: [] }
  });
  
  const [activeTab, setActiveTab] = useState('editor'); // editor, visuals

  const lastSavedContent = useRef('');
  const autosaveTimer = useRef(null);

  // Load all projects on mount
  useEffect(() => {
    fetchProjects(true);
  }, []);

  // Set up auto-save whenever editor content changes
  useEffect(() => {
    if (!activeProjectId) return;
    
    // If the content changed from the last saved content, mark as unsaved
    if (editorContent !== lastSavedContent.current) {
      setSaveStatus('unsaved');
      
      // Debounce autosave: save 3 seconds after typing stops
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        handleSaveProject();
      }, 3000);
    }

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [editorContent]);

  const fetchProjects = async (shouldLoadFirst = false) => {
    try {
      const res = await projectsService.getProjects();
      const loadedProjects = res.data.data || [];
      setProjects(loadedProjects);

      if (shouldLoadFirst) {
        if (loadedProjects.length > 0) {
          loadProject(loadedProjects[0]._id);
        } else {
          // If no projects exist, create a default one
          handleCreateProject();
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const loadProject = async (id) => {
    try {
      setActiveProjectId(id);
      setSaveStatus('saving');
      const res = await projectsService.getProject(id);
      const project = res.data.data;
      
      setEditorContent(project.editorContent || `<p>${project.text || ''}</p>`);
      setProjectData({
        keywords: project.keywords || {},
        flowchart: project.flowchart || '',
        graph: project.graph || { nodes: [], links: [] }
      });

      lastSavedContent.current = project.editorContent || `<p>${project.text || ''}</p>`;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to load project', err);
      setSaveStatus('unsaved');
    }
  };

  const handleCreateProject = async () => {
    try {
      setIsProcessing(true);
      const newProj = {
        name: `Untitled Project ${projects.length + 1}`,
        text: '',
        editorContent: '<p></p>',
        keywords: {},
        flowchart: '',
        graph: { nodes: [], links: [] }
      };

      const res = await projectsService.saveProject(newProj);
      const created = res.data.data;

      // Refetch and set active
      await fetchProjects(false);
      setActiveProjectId(created._id);
      setEditorContent(created.editorContent);
      setProjectData({
        keywords: {},
        flowchart: '',
        graph: { nodes: [], links: [] }
      });
      lastSavedContent.current = created.editorContent;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectsService.deleteProject(id);
      
      // Update list
      const remaining = projects.filter(p => p._id !== id);
      setProjects(remaining);

      if (activeProjectId === id) {
        if (remaining.length > 0) {
          loadProject(remaining[0]._id);
        } else {
          handleCreateProject();
        }
      }
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleRenameProject = async (id, newName) => {
    try {
      // Find current local project state
      const targetProj = projects.find(p => p._id === id);
      if (!targetProj) return;

      const updatedProj = { ...targetProj, name: newName };
      await projectsService.saveProject(updatedProj);
      
      // Refetch
      fetchProjects(false);
    } catch (err) {
      console.error('Failed to rename project', err);
    }
  };

  const handleSaveProject = async () => {
    if (!activeProjectId) return;
    setSaveStatus('saving');

    try {
      const activeProj = projects.find(p => p._id === activeProjectId);
      if (!activeProj) return;

      const payload = {
        ...activeProj,
        editorContent,
        text: editorContent.replace(/<[^>]*>?/gm, ''), // plain text representation
        keywords: projectData.keywords,
        flowchart: projectData.flowchart,
        graph: projectData.graph
      };

      await projectsService.saveProject(payload);
      lastSavedContent.current = editorContent;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed', err);
      setSaveStatus('unsaved');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const res = await uploadService.uploadFile(file);
      const text = res.data.data;
      const cleanHtml = `<p>${text.replace(/\n/g, '<br />')}</p>`;
      
      setEditorContent(cleanHtml);
      setSaveStatus('unsaved');
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!editorContent.replace(/<[^>]*>?/gm, '').trim()) return;
    setIsProcessing(true);
    setSaveStatus('saving');
    
    try {
      // Step 1: Generate premium smart notes in English/Urdu
      const notesRes = await aiService.generateSmartNotes(editorContent);
      const smartNotesHtml = notesRes.data.data;
      setEditorContent(smartNotesHtml);

      // Step 2: Generate rich interactive graph & chart data from notes
      const visualsRes = await aiService.generateVisuals(smartNotesHtml);
      const parsedVisuals = visualsRes.data.data;
      
      const newVisuals = {
        keywords: parsedVisuals.keywords || {},
        flowchart: parsedVisuals.flowchart || '',
        graph: parsedVisuals.graph || { nodes: [], links: [] }
      };

      setProjectData(newVisuals);

      // Force instant save to database to persist newly generated notes
      const activeProj = projects.find(p => p._id === activeProjectId);
      if (activeProj) {
        const payload = {
          ...activeProj,
          editorContent: smartNotesHtml,
          text: smartNotesHtml.replace(/<[^>]*>?/gm, ''),
          ...newVisuals
        };
        await projectsService.saveProject(payload);
        lastSavedContent.current = smartNotesHtml;
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('AI synthesis failed', err);
      setSaveStatus('unsaved');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (type) => {
    try {
      if (type === 'pdf') {
        // High fidelity frontend rendering PDF
        await exportToPdf('rich-editor-container', `${activeProjectName()}.pdf`);
        return;
      }

      const res = await exportService.exportDocx(activeProjectName(), editorContent);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeProjectName()}.${type}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const activeProjectName = () => {
    const active = projects.find(p => p._id === activeProjectId);
    return active ? active.name : 'MindScribe Project';
  };

  const getPlainTextForSpeech = () => {
    return editorContent.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="flex h-full w-full p-4 gap-6 bg-background">
      {/* Dynamic Project Sidebar */}
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={loadProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />
      
      {/* Workspace Dashboard */}
      <main className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Header Control Panel */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 flex justify-between items-center z-10"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex flex-col min-w-0">
              <h1 className="text-md font-bold truncate text-textMain">
                {activeProjectName()}
              </h1>
              
              {/* Dynamic Auto-save and Status Indicators */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {saveStatus === 'saved' && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 font-mono uppercase">
                    <Check size={10} /> Auto-saved
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-[10px] text-yellow-400 flex items-center gap-1 font-mono uppercase">
                    ● Unsaved changes
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="text-[10px] text-primary flex items-center gap-1 font-mono uppercase">
                    <RefreshCw size={10} className="animate-spin" /> Syncing...
                  </span>
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

            {/* Premium Narration Controller Embedded in Header */}
            <div className="hidden lg:block">
              <VoiceControls text={getPlainTextForSpeech()} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Tab Selector */}
            <div className="flex gap-1 bg-black/25 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${activeTab === 'editor' ? 'bg-primary text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'text-textMuted hover:text-textMain'}`}
              >
                Document
              </button>
              <button 
                onClick={() => setActiveTab('visuals')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${activeTab === 'visuals' ? 'bg-primary text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]' : 'text-textMuted hover:text-textMain'}`}
              >
                Visuals
              </button>
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* Document Import */}
            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all border border-white/10 text-xs font-medium">
              <Upload size={14} className="text-primary" />
              <span>Import</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
            </label>

            {/* Manual Save */}
            <button 
              onClick={handleSaveProject}
              className="p-2 hover:bg-white/10 rounded-lg border border-white/5 text-textMuted hover:text-textMain transition-all cursor-pointer"
              title="Save Project"
            >
              <Save size={16} />
            </button>

            {/* AI Synthesize */}
            <button 
              onClick={handleGenerateNotes}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_15px_rgba(192,132,252,0.3)]"
            >
              <Sparkles size={14} />
              AI Synthesize
            </button>

            {/* Export Actions */}
            <div className="flex gap-1 bg-black/25 p-1 rounded-lg border border-white/5">
              <button onClick={() => handleExport('pdf')} className="p-1.5 hover:bg-white/10 rounded text-textMuted hover:text-textMain transition-colors" title="Export PDF">
                <Download size={14} />
              </button>
              <button onClick={() => handleExport('docx')} className="p-1.5 hover:bg-white/10 rounded text-textMuted hover:text-textMain transition-colors" title="Export DOCX">
                <FileText size={14} />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Narrative Voice on Small Screens */}
        <div className="block lg:hidden glass-panel p-3 flex justify-center z-10">
          <VoiceControls text={getPlainTextForSpeech()} />
        </div>

        {/* Content Workspace Split Panel */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Main Visuals or Editor Tab */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
            
            {/* Loading Cover Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl border border-primary/10">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_#38bdf8]" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-accent rounded-full shadow-[0_0_8px_#c084fc]" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_#38bdf8]" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Synthesizing Smart Notes...</span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'editor' ? (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 overflow-hidden"
                >
                  <RichEditor content={editorContent} onChange={setEditorContent} />
                </motion.div>
              ) : (
                <motion.div 
                  key="visuals"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1"
                >
                  <KeywordCharts keywords={projectData.keywords} />
                  <FlowchartPanel definition={projectData.flowchart} />
                  <ConceptGraph data={projectData.graph} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Helper Q&A Panel */}
          <aside className="w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <AIResponsePanel currentText={getPlainTextForSpeech()} />
          </aside>
        </div>
      </main>
    </div>
  );
}
