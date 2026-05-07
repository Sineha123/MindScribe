import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '#' },
    { name: 'Analytics', path: '#' },
    { name: 'Settings', path: '#' }
  ];

  return (
    <motion.aside 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 glass-panel flex flex-col p-6 gap-8 h-full z-10"
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center animate-pulse-glow">
          <span className="font-bold text-lg text-white">M</span>
        </div>
        <h2 className="text-xl font-bold tracking-wide">MindScribe</h2>
      </div>

      <nav className="flex-1 flex flex-col gap-4">
        <p className="text-xs uppercase text-textMuted font-semibold tracking-wider">Menu</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.name} 
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={`text-left px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none 
                ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-white/10 hover:text-primary hover:pl-6 focus:bg-white/10'}`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all duration-500"></div>
          <h3 className="relative z-10 font-medium text-primary">AI Status</h3>
          <p className="relative z-10 text-sm text-textMain mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
