/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Users, Map as MapIcon, ChevronRight, Target, BookOpen } from 'lucide-react';
import ShinyHunting from './pages/ShinyHunting';
import CustomGames from './pages/CustomGames';
import Pokedex from './pages/Pokedex';
import TeamAnalyzer from './pages/TeamAnalyzer';
import WorldMap from './pages/WorldMap';
import Layout from './components/Layout';

const MotionLink = motion(Link);

function Home() {
  const features = [
    { 
      title: 'Shiny Hunting', 
      description: 'Traccia i tuoi incontri e trova Pokémon cromatici.', 
      icon: Target, 
      color: 'bg-yellow-500', 
      path: '/shiny-hunting' 
    },
    { 
      title: 'Pokédex', 
      description: 'Crea e gestisci le tue collezioni personali.', 
      icon: BookOpen, 
      color: 'bg-red-500', 
      path: '/pokedex' 
    },
    { 
      title: 'Squadra', 
      description: 'Crea e analizza il tuo team perfetto.', 
      icon: Users, 
      color: 'bg-blue-500', 
      path: '/team' 
    },
    { 
      title: 'Mappa', 
      description: 'Esplora i percorsi e trova i Pokémon selvatici.', 
      icon: MapIcon, 
      color: 'bg-emerald-500', 
      path: '/map' 
    },
    { 
      title: 'Versioni', 
      description: 'Crea e gestisci le tue versioni di gioco personalizzate.', 
      icon: Target, 
      color: 'bg-blue-500', 
      path: '/custom-games' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 uppercase italic">
          Benvenuto, <span className="text-red-600">Allenatore</span>.
        </h2>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
          Il tuo hub personale per l'avventura. Cosa vuoi fare oggi? Seleziona un'app dal tuo RotomDex per iniziare.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <MotionLink
            key={feature.title}
            to={feature.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group block bg-slate-900 rounded-[2rem] p-8 shadow-2xl hover:shadow-red-900/10 transition-all border border-slate-800 hover:border-red-500/50 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50 group-hover:via-red-500 transition-all"></div>
            
            <div className={`w-14 h-14 ${feature.color} text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight">{feature.title}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">{feature.description}</p>
            <div className="flex items-center text-xs font-black uppercase tracking-widest text-red-500 group-hover:translate-x-2 transition-transform">
              Avvia applicazione <ChevronRight size={16} className="ml-1" />
            </div>
          </MotionLink>
        ))}
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
        <Search size={32} className="text-slate-700" />
      </div>
      <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">{title}</h2>
      <p className="text-slate-400 mb-8 max-w-md font-medium">Questa funzione è in fase di sviluppo. Dimmi cosa vuoi aggiungere per renderla perfetta!</p>
      <Link to="/" className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/20 active:scale-95">
        Torna alla Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shiny-hunting" element={<ShinyHunting />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/team" element={<TeamAnalyzer />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/custom-games" element={<CustomGames />} />
        </Routes>
      </Layout>
    </Router>
  );
}
