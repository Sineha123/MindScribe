import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, Trash2, Edit2, Check, Plus, BrainCircuit } from 'lucide-react';

export default function Sidebar({ 
  projects = [], 
  activeProjectId = null, 
  onSelectProject = () => {}, 
  onCreateProject = () => {}, 
  onDeleteProject = () => {}, 
  onRenameProject = () => {} 
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (e, project) => {
    e.stopPropagation();
    setEditingId(project._id);
    setEditingName(project.name || 'Untitled Project');
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onRenameProject(id, editingName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveRename(e, id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <motion.aside 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-68 glass-panel flex flex-col p-5 gap-6 h-full z-10 overflow-hidden"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center animate-pulse-glow">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-wide leading-tight">MindScribe</h2>
          <span className="text-[10px] text-textMuted uppercase font-mono tracking-widest">Workspace</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={onCreateProject}
        className="primary-button w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition-all border border-primary/20 cursor-pointer"
      >
        <Plus size={16} />
        New Project
      </button>

      {/* Projects List Section */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase text-textMuted font-semibold tracking-wider">My Projects</p>
          <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-textMuted">
            {projects.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-xs text-textMuted italic border border-dashed border-white/5 rounded-xl">
              No projects saved.
            </div>
          ) : (
            projects.map((project) => {
              const isActive = activeProjectId === project._id;
              const isEditing = editingId === project._id;

              return (
                <div 
                  key={project._id}
                  onClick={() => !isEditing && onSelectProject(project._id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 border cursor-pointer
                    ${isActive 
                      ? 'bg-primary/10 text-textMain border-primary/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]' 
                      : 'bg-white/0 text-textMuted border-transparent hover:bg-white/5 hover:text-textMain'}`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Folder size={16} className={isActive ? 'text-primary' : 'text-textMuted group-hover:text-primary transition-colors'} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={(e) => handleSaveRename(e, project._id)}
                        onKeyDown={(e) => handleKeyDown(e, project._id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="bg-black/40 border border-primary/50 rounded px-1.5 py-0.5 text-xs text-textMain focus:outline-none w-full"
                      />
                    ) : (
                      <span className="text-xs font-medium truncate block">
                        {project.name || 'Untitled Project'}
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200 pl-2">
                      <button 
                        onClick={(e) => handleStartRename(e, project)}
                        className="p-1 hover:bg-white/10 rounded text-textMuted hover:text-primary transition-colors"
                        title="Rename"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this project?')) {
                            onDeleteProject(project._id);
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded text-textMuted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <button 
                      onClick={(e) => handleSaveRename(e, project._id)}
                      className="p-1 hover:bg-white/10 rounded text-green-400 hover:text-green-300 transition-colors"
                      title="Save"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* System Footer Status */}
      <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all duration-500"></div>
          <h3 className="relative z-10 text-xs font-semibold text-primary uppercase tracking-wider font-mono">System Core</h3>
          <p className="relative z-10 text-xs text-textMain mt-1.5 flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span> 
            Gemini 2.5 Active
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
