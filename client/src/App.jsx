import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Scene from './components/three/Scene';

function App() {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden text-textMain">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Scene />
      </div>
      
      {/* Main UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
