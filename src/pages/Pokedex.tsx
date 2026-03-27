import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, BookOpen, CheckCircle2, Sparkles, Trash2, ChevronRight, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import AdBanner from '../components/AdBanner';
import { Pokemon, PersonalPokedex, CaughtPokemon, Game } from '../types';
import { GAMES } from '../constants';
import { usePokemonData } from '../hooks/usePokemonData';
import { usePokemonList } from '../hooks/usePokemonList';
import { Loader2 } from 'lucide-react';

export default function Pokedex() {
  const { t } = useTranslation();
  const { pokemonList, isLoading: isPokemonListLoading } = usePokemonList();
  const { data: pokedexes, addItem: addPokedex, updateItem: updatePokedex, removeItem: removePokedex, loading: pokedexesLoading } = usePokemonData<PersonalPokedex>('pokedexes');
  const { data: customGames } = usePokemonData<Game>('customGames');
  
  const [selectedPokedexId, setSelectedPokedexId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [gamePokemonIds, setGamePokemonIds] = useState<number[] | null>(null);
  const [isGameDexLoading, setIsGameDexLoading] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const ITEMS_PER_PAGE = 50;
  
  // New Pokedex Form
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [pokedexToDelete, setPokedexToDelete] = useState<string | null>(null);

  // Timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPokemonListLoading || pokedexesLoading) {
        console.warn('Pokedex loading timeout reached, forcing ready state');
        setForceReady(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isPokemonListLoading, pokedexesLoading]);

  const allAvailableGames = useMemo(() => {
    const hydratedCustom = customGames.map(g => {
      if (!g.maxNationalId && g.pokedex) {
        const base = GAMES.find(bg => bg.pokedex === g.pokedex);
        if (base) return { ...g, maxNationalId: base.maxNationalId };
      }
      return g;
    });
    return [...hydratedCustom, ...GAMES];
  }, [customGames]);

  useEffect(() => {
    if (pokedexes.length > 0 && !selectedPokedexId) {
      setSelectedPokedexId(pokedexes[0].id!);
    }
    if (allAvailableGames.length > 0 && !selectedGameId) {
      setSelectedGameId(allAvailableGames[0].id);
    }
  }, [pokedexes, allAvailableGames, selectedPokedexId, selectedGameId]);

  const deletePokedex = async (id: string) => {
    await removePokedex(id);
    if (selectedPokedexId === id) {
      setSelectedPokedexId(pokedexes.length > 1 ? pokedexes.find(d => d.id !== id)?.id || null : null);
    }
    setPokedexToDelete(null);
  };

  const createPokedex = async () => {
    if (!newName || !selectedGameId) return;
    const game = allAvailableGames.find(g => g.id === selectedGameId);
    if (!game) return;
    
    const newDex: Omit<PersonalPokedex, 'id'> = {
      name: newName,
      gameId: game.id,
      gameName: game.name,
      caughtData: {}
    };
    
    await addPokedex(newDex);
    setNewName('');
    setIsCreating(false);
  };

  const currentPokedex = useMemo(() => 
    pokedexes.find(d => d.id === selectedPokedexId), 
    [pokedexes, selectedPokedexId]
  );

  const lastGameIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const fetchGamePokemon = async () => {
      if (!currentPokedex) {
        setGamePokemonIds(null);
        lastGameIdRef.current = null;
        return;
      }

      if (currentPokedex.gameId === lastGameIdRef.current) {
        return;
      }

      const game = allAvailableGames.find(g => g.id === currentPokedex.gameId);
      if (!game || !game.pokedex) {
        setGamePokemonIds(null);
        lastGameIdRef.current = currentPokedex.gameId;
        return;
      }

      setIsGameDexLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${game.pokedex}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const ids = data.pokemon_entries.map((entry: any) => {
          const urlParts = entry.pokemon_species.url.split('/');
          return parseInt(urlParts[urlParts.length - 2]);
        });
        setGamePokemonIds(ids);
        lastGameIdRef.current = currentPokedex.gameId;
      } catch (error) {
        console.error('Error fetching game pokedex:', error);
        setGamePokemonIds(null);
      } finally {
        setIsGameDexLoading(false);
      }
    };
    fetchGamePokemon();
  }, [currentPokedex?.gameId, allAvailableGames]);

  const toggleCaught = async (pokemonId: number, type: 'normal' | 'shiny') => {
    if (!selectedPokedexId || !currentPokedex) return;
    
    const currentData = currentPokedex.caughtData[pokemonId] || { caught: false, shiny: false };
    const newData: CaughtPokemon = { ...currentData };
    
    if (type === 'normal') {
      newData.caught = !newData.caught;
      if (!newData.caught) newData.shiny = false;
    }
    if (type === 'shiny') {
      newData.shiny = !newData.shiny;
      if (newData.shiny) newData.caught = true;
    }
    
    const updatedCaughtData = { 
      ...currentPokedex.caughtData, 
      [pokemonId]: newData 
    };

    await updatePokedex(selectedPokedexId, { caughtData: updatedCaughtData });
  };

  const filteredPokemon = useMemo(() => {
    let filtered = pokemonList;
    
    const game = currentPokedex ? allAvailableGames.find(g => g.id === currentPokedex.gameId) : null;
    
    // Filter by game pokedex if available
    if (game?.maxNationalId) {
      filtered = pokemonList.filter(p => p.id <= game.maxNationalId!);
    } else if (gamePokemonIds && gamePokemonIds.length > 0) {
      filtered = pokemonList.filter(p => gamePokemonIds.includes(p.id));
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toString() === searchTerm
      );
    }
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    return {
      items: filtered.slice(start, end),
      totalPages,
      totalItems
    };
  }, [searchTerm, pokemonList, currentPage, gamePokemonIds, currentPokedex, allAvailableGames]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stats = useMemo(() => {
    if (!currentPokedex) return { total: 0, caught: 0, shiny: 0, percent: 0 };
    
    const game = allAvailableGames.find(g => g.id === currentPokedex.gameId);
    
    // Use maxNationalId if available, otherwise fallback to gamePokemonIds length, 
    // and finally to 1025 as a last resort.
    const total = game?.maxNationalId || (gamePokemonIds ? gamePokemonIds.length : 1025);
    
    let caught = 0;
    let shiny = 0;

    // Only count pokemon that are actually in this game's pokedex
    Object.entries(currentPokedex.caughtData).forEach(([id, data]) => {
      const pId = parseInt(id);
      // If we have a maxNationalId, use it for filtering. 
      // Otherwise, if we have specific game IDs, check against those.
      const isInDex = game?.maxNationalId 
        ? pId <= game.maxNationalId 
        : (!gamePokemonIds || gamePokemonIds.includes(pId));
      
      if (isInDex) {
        if (data.caught) caught++;
        if (data.shiny) shiny++;
      }
    });

    return {
      total,
      caught,
      shiny,
      percent: total > 0 ? ((caught / total) * 100).toFixed(1) : "0.0"
    };
  }, [currentPokedex, gamePokemonIds, allAvailableGames]);

  if ((isPokemonListLoading || pokedexesLoading) && !forceReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase italic tracking-widest">{t('pokedex.loading')}</p>
        <button 
          onClick={() => setForceReady(true)}
          className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-red-500 transition-colors"
        >
          {t('pokedex.forceLoading')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
      <Helmet>
        <title>Pokédex - Trainer's Log | Manage Your Pokémon Collection</title>
        <meta name="description" content="Keep track of your caught Pokémon across different games. Create custom Pokédexes, monitor your completion progress, and catch 'em all with Trainer's Log." />
        <meta name="keywords" content="Pokédex, Pokémon Collection, Catch 'em all, Pokémon Tracker, Living Dex, Shiny Pokémon, Pokémon Games" />
        <link rel="canonical" href="https://www.trainerslog.com/pokedex" />
      </Helmet>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            {t('pokedex.title')} <span className="text-red-500">{t('pokedex.subtitle')}</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{t('pokedex.manageCollections')}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-red-900/20 active:scale-95"
        >
          <Plus size={24} />
          {t('pokedex.newPokedex')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: List of Pokedexes */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen size={16} />
              {t('pokedex.activeCollections')}
            </h3>
            
            <div className="space-y-3">
              {pokedexes.length === 0 ? (
                <div className="py-8 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest border border-dashed border-slate-800 rounded-2xl">
                  {t('pokedex.noPokedexCreated')}
                </div>
              ) : pokedexes.map(dex => (
                <div 
                  key={dex.id}
                  onClick={() => setSelectedPokedexId(dex.id)}
                  className={`group p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPokedexId === dex.id 
                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/20' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-black uppercase italic ${selectedPokedexId === dex.id ? 'text-white' : 'text-slate-200'}`}>
                      {dex.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedPokedexId === dex.id ? 'text-red-200' : 'text-slate-500'}`}>
                      {t(dex.gameName)}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPokedexToDelete(dex.id); }}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedPokedexId === dex.id ? 'hover:bg-red-700 text-white' : 'hover:bg-red-600/20 text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {currentPokedex && (
            <section className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-30"></div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={16} />
                {t('pokedex.stats')}
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('pokedex.completion')}</span>
                    <div className="text-4xl font-black text-white italic">{stats.percent}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('pokedex.caught')}</span>
                    <div className="text-xl font-black text-emerald-400 italic">{stats.caught} / {stats.total}</div>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percent}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>

                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                      <Sparkles size={20} className="text-yellow-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('pokedex.shiny')}</span>
                  </div>
                  <div className="text-2xl font-black text-yellow-500 italic">{stats.shiny}</div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Main Content: Pokemon List */}
        <div className="lg:col-span-8">
          {isGameDexLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-black uppercase italic tracking-widest">{t('pokedex.syncing')}</p>
            </div>
          ) : currentPokedex ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                <input 
                  type="text"
                  placeholder={t('pokedex.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] pl-14 pr-6 py-5 text-xl font-bold focus:ring-4 focus:ring-red-500/20 outline-none transition-all shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredPokemon.items.map(p => {
                    const status = currentPokedex.caughtData[p.id] || { caught: false, shiny: false };
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group p-4 rounded-[2rem] border transition-all flex flex-col items-center gap-4 ${
                          status.caught 
                          ? 'bg-slate-900 border-emerald-500/30' 
                          : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="relative w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <img 
                            src={status.shiny ? p.shinySprite : p.sprite} 
                            alt={p.name} 
                            loading="lazy"
                            className={`w-20 h-20 pixelated transition-all ${!status.caught && 'brightness-0 opacity-20'}`} 
                          />
                          {status.shiny && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <Sparkles size={16} className="text-slate-950" />
                            </div>
                          )}
                        </div>

                        <div className="text-center w-full">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">#{p.id.toString().padStart(3, '0')}</span>
                          <h4 className={`text-lg font-black uppercase italic truncate ${status.caught ? 'text-white' : 'text-slate-600'}`}>
                            {p.name}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full">
                          <button 
                            type="button"
                            onClick={() => toggleCaught(p.id, 'normal')}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
                              status.caught 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                              : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            <CheckCircle2 size={12} />
                            {status.caught ? t('pokedex.caughtButton') : t('pokedex.catchButton')}
                          </button>
                          <button 
                            type="button"
                            onClick={() => toggleCaught(p.id, 'shiny')}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${
                              status.shiny 
                              ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-900/20' 
                              : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            <Sparkles size={12} />
                            {t('pokedex.shiny')}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {filteredPokemon.totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-12 bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl transition-all border border-slate-700"
                  >
                    <ChevronRight size={24} className="rotate-180 text-slate-400" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('pokedex.page')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black italic text-white">{currentPage}</span>
                      <span className="text-sm font-black text-slate-600">/</span>
                      <span className="text-xl font-black italic text-slate-500">{filteredPokemon.totalPages}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(filteredPokemon.totalPages, prev + 1))}
                    disabled={currentPage === filteredPokemon.totalPages}
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl transition-all border border-slate-700"
                  >
                    <ChevronRight size={24} className="text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                <BookOpen size={40} className="text-slate-700" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-tighter">{t('pokedex.noPokedexSelected')}</h3>
              <p className="text-slate-600 max-w-xs mt-4 font-medium leading-relaxed">
                {t('pokedex.noPokedexSelectedDesc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-30"></div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">{t('pokedex.createTitle')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('pokedex.collectionName')}</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Es: My Living Dex"
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('pokedex.gameVersion')}</label>
                  <select 
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {allAvailableGames.map((g) => (
                      <option key={g.id} value={g.id}>{g.isCustom ? `✨ ${g.name}` : t(g.name)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black uppercase tracking-widest transition-all"
                  >
                    {t('pokedex.cancel')}
                  </button>
                  <button 
                    onClick={createPokedex}
                    disabled={!newName}
                    className="flex-2 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50"
                  >
                    {t('pokedex.createButton')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {pokedexToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPokedexToDelete(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600/20">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{t('pokedex.deleteConfirmTitle')}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                {t('pokedex.deleteConfirmDesc')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPokedexToDelete(null)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  {t('pokedex.cancel')}
                </button>
                <button 
                  onClick={() => deletePokedex(pokedexToDelete)}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20"
                >
                  {t('pokedex.deleteButton')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-grow bg-slate-800"></div>
          <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">Sponsorizzato</span>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <AdBanner type="horizontal" className="mx-auto" />
      </div>

      <style>{`
        .pixelated {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}
