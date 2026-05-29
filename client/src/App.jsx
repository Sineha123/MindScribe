import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Splash from './pages/Splash';
import ProjectsOverview from './pages/ProjectsOverview';
import Scene from './components/three/Scene';
import SettingsDialog from './components/layout/SettingsDialog';

function App() {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden text-textMain">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Scene />
      </div>
      
      {/* Main UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col">
        <SettingsDialog />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/projects" element={<ProjectsOverview />} />
          <Route path="/editor/:id" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
