import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Target, BookOpen, Users, Map as MapIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/shiny-hunting', label: 'Shiny Hunter', icon: Target },
    { path: '/pokedex', label: 'Pokédex', icon: BookOpen },
    { path: '/team', label: 'Squadra', icon: Users },
    { path: '/map', label: 'Mappa', icon: MapIcon },
    { path: '/custom-games', label: 'Versioni', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden">
               <div className="absolute top-0 w-full h-1/2 bg-red-600 border-b-2 border-slate-900"></div>
               <div className="absolute bottom-0 w-full h-1/2 bg-white border-t-2 border-slate-900"></div>
               <div className="w-3 h-3 bg-white rounded-full border-2 border-slate-900 z-10"></div>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">
              RotomDex <span className="text-red-500">Companion</span>
            </h1>
          </Link>

          <nav className="hidden lg:flex gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="lg:hidden">
            {/* Mobile Menu Trigger (Simplified for now) */}
            <button className="p-2 text-slate-400 hover:text-white">
              <span className="sr-only">Menu</span>
              <div className="w-6 h-0.5 bg-current mb-1.5"></div>
              <div className="w-6 h-0.5 bg-current mb-1.5"></div>
              <div className="w-6 h-0.5 bg-current"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-slate-900/50 border-t border-slate-800 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
          <div className="flex items-center gap-4">
            <span>RotomDex Companion</span>
          </div>
          <div className="max-w-md opacity-60">
            © 2026 RotomDex Companion. RotomDex e Pokémon sono marchi registrati di The Pokémon Company, Nintendo, Game Freak e Creatures Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
