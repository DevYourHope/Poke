import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, ChevronRight, Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  generation: number;
  mapUrl: string;
  description: string;
}

const REGIONS: Region[] = [
  {
    id: 'kanto',
    name: 'Kanto',
    generation: 1,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/25.png',
    description: 'La regione dove tutto ha avuto inizio. Casa del Professor Oak e di Biancavilla.'
  },
  {
    id: 'johto',
    name: 'Johto',
    generation: 2,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/152.png',
    description: 'Una regione ricca di tradizioni, situata a ovest di Kanto.'
  },
  {
    id: 'hoenn',
    name: 'Hoenn',
    generation: 3,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/252.png',
    description: 'Una regione tropicale con vasti oceani e vulcani attivi.'
  },
  {
    id: 'sinnoh',
    name: 'Sinnoh',
    generation: 4,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/387.png',
    description: 'Una regione montuosa dominata dal Monte Corona, ricca di miti sulle origini del mondo.'
  },
  {
    id: 'unova',
    name: 'Unima',
    generation: 5,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/495.png',
    description: 'Una regione metropolitana ispirata a New York, lontana dalle altre regioni conosciute.'
  },
  {
    id: 'kalos',
    name: 'Kalos',
    generation: 6,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/650.png',
    description: 'Una regione a forma di stella ispirata alla Francia, culla della Megaevoluzione.'
  },
  {
    id: 'alola',
    name: 'Alola',
    generation: 7,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/722.png',
    description: 'Un arcipelago tropicale composto da quattro isole naturali e una artificiale.'
  },
  {
    id: 'galar',
    name: 'Galar',
    generation: 8,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/810.png',
    description: 'Una regione ispirata al Regno Unito, famosa per il fenomeno Dynamax.'
  },
  {
    id: 'paldea',
    name: 'Paldea',
    generation: 9,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/906.png',
    description: 'Una vasta regione open-world ispirata alla penisola iberica, casa del fenomeno Teracristal.'
  },
  {
    id: 'hisui',
    name: 'Hisui',
    generation: 8,
    mapUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/other/official-artwork/905.png',
    description: 'L\'antica Sinnoh, un\'epoca in cui umani e Pokémon vivevano separati.'
  }
];

export default function WorldMap() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [zoom, setZoom] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Direct URL loading - no proxy needed for PokeAPI
  const getProxyUrl = (url: string) => {
    return url;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoom(1);

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region);
    setZoom(1);
    setIsLoading(true);
    setHasError(false);
  };

  // Robust loading logic with timeout
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.src = getProxyUrl(selectedRegion.mapUrl);
    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Map loading timed out');
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 seconds timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setHasError(false);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setHasError(true);
    };

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [selectedRegion.id]);

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden bg-slate-950">
      {/* Sidebar Selector */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-20"
          >
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <MapIcon className="text-red-500" size={24} />
                Regioni
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Seleziona una mappa da esplorare
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionChange(region)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border flex items-center justify-between group ${
                    selectedRegion.id === region.id
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                      Gen {region.generation}
                    </div>
                    <div className="font-black uppercase italic tracking-tight text-lg">
                      {region.name}
                    </div>
                  </div>
                  <ChevronRight 
                    size={18} 
                    className={`transition-transform group-hover:translate-x-1 ${
                      selectedRegion.id === region.id ? 'text-white' : 'text-slate-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Map View */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Map Header */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl max-w-md pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {selectedRegion.name}
              </h3>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {selectedRegion.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-2xl flex flex-col">
              <button 
                onClick={handleZoomIn}
                className="p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <div className="h-px bg-slate-800 mx-2"></div>
              <button 
                onClick={handleZoomOut}
                className="p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <div className="h-px bg-slate-800 mx-2"></div>
              <button 
                onClick={handleResetZoom}
                className="p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-12 custom-scrollbar relative">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Caricamento Mappa...</p>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-6 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <Search size={32} className="text-red-500" />
              </div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">Errore di Caricamento</h4>
              <p className="text-slate-400 text-sm max-w-xs font-medium">Impossibile caricare la mappa della regione {selectedRegion.name}. Controlla la tua connessione.</p>
              <button 
                onClick={() => handleRegionChange(selectedRegion)}
                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Riprova
              </button>
            </div>
          )}

          <motion.div
            key={selectedRegion.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: zoom, opacity: isLoading ? 0 : 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative cursor-grab active:cursor-grabbing"
          >
            <img
              src={getProxyUrl(selectedRegion.mapUrl)}
              alt={`Mappa di ${selectedRegion.name}`}
              className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-800"
              referrerPolicy="no-referrer"
              draggable={false}
            />
            
            {/* Grid Overlay (Optional aesthetic) */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
          </motion.div>
        </div>

        {/* Footer Status */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Sistema RotomMap Attivo
            </span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
          <div>Regione {selectedRegion.name} Caricata</div>
        </div>
      </main>
    </div>
  );
}
