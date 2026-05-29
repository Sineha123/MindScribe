import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { projectsService } from '../services/api';

export default function ProjectsOverview() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectsService.getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
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
      navigate(`/editor/${created._id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await projectsService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-8 max-w-6xl mx-auto overflow-y-auto custom-scrollbar">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-2">Your Projects</h1>
          <p className="text-textMuted text-sm">Select a project to continue synthesizing, or start a new one.</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12"
        >
          {/* Create New Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateProject}
            className="glass-panel flex flex-col items-center justify-center p-8 min-h-[200px] cursor-pointer hover:border-primary/50 group transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-textMain">Create New Project</h3>
          </motion.div>

          {/* Project Cards */}
          {projects.map((project) => (
            <motion.div
              key={project._id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/editor/${project._id}`)}
              className="glass-panel flex flex-col p-6 min-h-[200px] cursor-pointer hover:border-white/20 transition-all relative group"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <FileText size={24} />
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, project._id)}
                    className="p-2 text-textMuted hover:text-red-400 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-textMain mb-2 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-textMuted line-clamp-3">
                  {project.text ? project.text.substring(0, 120) : "Empty project"}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
