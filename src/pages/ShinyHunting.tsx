import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import AdBanner from '../components/AdBanner';
import { Plus, Minus, Trophy, Search, Gamepad2, Info, Sparkles, Settings2, History, Calendar, Trash2, Loader2 } from 'lucide-react';
import { Game, Pokemon, ShinyRecord } from '../types';
import { GAMES } from '../constants';
import { usePokemonData } from '../hooks/usePokemonData';
import { usePokemonList } from '../hooks/usePokemonList';

export default function ShinyHunting() {
  const { t } = useTranslation();
  const { pokemonList, isLoading: isPokemonListLoading } = usePokemonList();
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [customOdds, setCustomOdds] = useState<number>(4096);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [encounters, setEncounters] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [gamePokemonIds, setGamePokemonIds] = useState<number[] | null>(null);
  const [isGameDexLoading, setIsGameDexLoading] = useState(false);

  const { data: shinyLog, addItem: addShiny, removeItem: removeShiny } = usePokemonData<ShinyRecord>('shinyHunts');
  const { data: customGames } = usePokemonData<Game>('customGames');

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
    if (allAvailableGames.length > 0 && !allAvailableGames.find(g => g.id === selectedGame.id)) {
      setSelectedGame(allAvailableGames[0]);
    }
  }, [allAvailableGames, selectedGame.id]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        setEncounters(prev => prev + 1);
      } else if (e.key === '-' || e.key === '_') {
        setEncounters(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchGamePokemon = async () => {
      if (!selectedGame || !selectedGame.pokedex) {
        setGamePokemonIds(null);
        return;
      }

      setIsGameDexLoading(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${selectedGame.pokedex}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const ids = data.pokemon_entries.map((entry: any) => {
          const urlParts = entry.pokemon_species.url.split('/');
          return parseInt(urlParts[urlParts.length - 2]);
        });
        setGamePokemonIds(ids);
      } catch (error) {
        console.error('Error fetching game pokedex:', error);
        setGamePokemonIds(null);
      } finally {
        setIsGameDexLoading(false);
      }
    };
    fetchGamePokemon();
  }, [selectedGame]);

  const filteredPokemon = useMemo(() => {
    let filtered = pokemonList;
    
    if (selectedGame.maxNationalId) {
      filtered = pokemonList.filter(p => p.id <= selectedGame.maxNationalId!);
    } else if (gamePokemonIds) {
      filtered = pokemonList.filter(p => gamePokemonIds.includes(p.id));
    }

    if (!searchTerm) return filtered.slice(0, 50);
    return filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toString() === searchTerm
    ).slice(0, 50);
  }, [searchTerm, pokemonList, gamePokemonIds, selectedGame]);

  const probability = useMemo(() => {
    const p = 1 / customOdds;
    const prob = 1 - Math.pow(1 - p, encounters);
    return (prob * 100).toFixed(2);
  }, [encounters, customOdds]);

  const baseProbPercent = useMemo(() => {
    return ((1 / customOdds) * 100).toFixed(4);
  }, [customOdds]);

  const handleGameChange = (gameId: string) => {
    const game = allAvailableGames.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setCustomOdds(game.baseOdds);
    }
  };

  const handleRegisterShiny = async () => {
    if (!selectedPokemon) return;
    
    const newRecord = {
      pokemon: selectedPokemon,
      pokemonId: selectedPokemon.id.toString(),
      pokemonName: selectedPokemon.name,
      game: selectedGame,
      encounters: encounters,
      date: Date.now(),
      notes: notes,
      status: 'caught'
    };

    await addShiny(newRecord);
    
    setEncounters(0);
    setNotes('');
    alert(`✨ ${selectedPokemon.name} ${t('shinyHunting.saved')} ✨`);
  };

  const deleteShinyRecord = (id: string) => {
    if (confirm(t('shinyHunting.deleteConfirm'))) {
      removeShiny(id);
    }
  };

  if (isPokemonListLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">{t('loadingPokemon')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
      <Helmet>
        <title>Shiny Hunter - Trainer's Log | Track Shiny Pokémon Encounters</title>
        <meta name="description" content="Use our Shiny Hunter tool to track your shiny Pokémon encounters. Calculate probabilities, manage your shiny log, and complete your shiny Pokédex." />
        <meta name="keywords" content="Shiny Hunting, Shiny Pokémon, Shiny Hunter, Pokémon Tracker, Shiny Odds, Masuda Method, Pokémon Shiny Log" />
        <link rel="canonical" href="https://www.trainerslog.com/shiny-hunting" />
      </Helmet>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            {t('shinyHunting.title')} <span className="text-yellow-500">{t('shinyHunting.hunter')}</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{t('shinyHunting.subtitle')}</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsSelectorOpen(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-red-900/20 active:scale-95"
          >
            <Search size={20} />
            {t('shinyHunting.choosePokemon')}
          </button>
          <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800">
            <Sparkles size={20} className="text-yellow-500" />
            <span className="text-sm font-black uppercase italic">{t('shinyHunting.activeSession')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-30"></div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase italic">
              <Settings2 size={24} className="text-blue-400" />
              {t('shinyHunting.parameters')}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('shinyHunting.gameVersion')}</label>
                <select 
                  value={selectedGame.id}
                  onChange={(e) => handleGameChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {allAvailableGames.map(g => (
                    <option key={g.id} value={g.id}>{g.isCustom ? `✨ ${g.name}` : t(g.name)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('shinyHunting.probability')}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={customOdds}
                    onChange={(e) => setCustomOdds(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-lg font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-32"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black italic text-[10px] uppercase tracking-tighter">{t('shinyHunting.probability')}</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic font-medium">
                  {selectedGame.isCustom 
                    ? t('shinyHunting.customVersionDesc', { pokedex: selectedGame.pokedex }) 
                    : t('shinyHunting.baseValueDesc', { game: t(selectedGame.name), odds: selectedGame.baseOdds })}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('shinyHunting.notesLabel')}</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('shinyHunting.notesPlaceholder')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all min-h-[100px] resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 uppercase italic">
              <Info size={24} className="text-emerald-400" />
              {t('shinyHunting.dataAnalysis')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.singleProb')}</span>
                <div className="text-2xl font-black text-blue-400 italic">{baseProbPercent}%</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.cumulativeSuccess')}</span>
                <div className="text-2xl font-black text-emerald-400 italic">{probability}%</div>
              </div>
            </div>
          </section>
        </div>

        {/* Counter Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedPokemon ? (
              <motion.div
                key={selectedPokemon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                {/* Sprites Display */}
                <div className="grid grid-cols-2 gap-8 md:gap-16 mb-12">
                  <div className="flex flex-col items-center group">
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 relative overflow-hidden group-hover:border-slate-700 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-800/50"></div>
                      <img src={selectedPokemon.sprite} alt={selectedPokemon.name} loading="lazy" className="w-32 h-32 md:w-48 md:h-48 pixelated relative z-10 drop-shadow-2xl" />
                    </div>
                    <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('shinyHunting.baseForm')}</span>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-slate-900 rounded-full flex items-center justify-center border border-yellow-500/30 relative overflow-hidden group-hover:border-yellow-500/50 transition-all shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/10"></div>
                      <img src={selectedPokemon.shinySprite} alt={selectedPokemon.name} loading="lazy" className="w-32 h-32 md:w-48 md:h-48 pixelated relative z-10 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                    </div>
                    <span className="mt-4 text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={12} /> {t('shinyHunting.shinyForm')}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-12">
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                    {selectedPokemon.name}
                  </h2>
                  <div className="inline-block px-4 py-1 bg-slate-800 rounded-full text-xs font-black text-slate-500 border border-slate-700 mt-2">
                    # {selectedPokemon.id.toString().padStart(4, '0')}
                  </div>
                </div>

                {/* Main Counter Widget */}
                <div className="w-full max-w-lg bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                  
                  <div className="text-center mb-10">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3 block">{t('shinyHunting.totalEncounters')}</span>
                    <div className="text-8xl md:text-9xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      {encounters}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <button 
                      onClick={() => setEncounters(Math.max(0, encounters - 1))}
                      className="h-20 bg-slate-800 hover:bg-slate-700 rounded-3xl flex items-center justify-center transition-all active:scale-90 border border-slate-700 group"
                    >
                      <Minus size={32} className="text-slate-500 group-hover:text-white" />
                    </button>
                    <button 
                      onClick={() => setEncounters(encounters + 1)}
                      className="h-20 col-span-3 bg-red-600 hover:bg-red-500 text-white rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-red-900/40 font-black text-2xl uppercase italic tracking-tight"
                    >
                      <Plus size={32} />
                      {t('shinyHunting.registerEncounter')}
                    </button>
                  </div>

                  {/* Probability Stats Below Arrows */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800 text-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.singleProb')}</span>
                      <div className="text-sm font-black text-blue-400 italic">{baseProbPercent}%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800 text-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.cumulativeSuccess')}</span>
                      <div className="text-sm font-black text-emerald-400 italic">{probability}%</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleRegisterShiny}
                    disabled={encounters === 0}
                    className="mt-8 w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-xl shadow-yellow-900/20"
                  >
                    <Trophy size={24} />
                    {t('shinyHunting.shinyFound')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 md:py-20">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 md:w-32 md:h-32 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl"
                >
                  <Search size={48} className="text-slate-700" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-400 uppercase italic tracking-tighter">{t('shinyHunting.startHunt')}</h3>
                <p className="text-slate-600 max-w-xs mt-3 font-medium leading-relaxed text-sm md:text-base">
                  {t('shinyHunting.startHuntDesc')}
                </p>
                <button 
                  onClick={() => setIsSelectorOpen(true)}
                  className="mt-8 px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 active:scale-95"
                >
                  {t('shinyHunting.openDatabase')}
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Shiny Log / Hall of Fame */}
      <section className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <History size={32} className="text-yellow-500" />
              {t('shinyHunting.shinyLog')} <span className="text-yellow-500">{t('shinyHunting.diary')}</span>
            </h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{t('shinyHunting.trophyRoom')}</p>
          </div>
          <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs font-black uppercase italic text-slate-400">
            {t('shinyHunting.total')}: {shinyLog.length}
          </div>
        </div>

        {shinyLog.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
            <Trophy size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">{t('shinyHunting.noShiny')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {shinyLog.map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 shadow-xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteShinyRecord(record.id)}
                      className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-yellow-500/5 rounded-3xl blur-xl"></div>
                      <img src={record.pokemon.shinySprite} alt={record.pokemon.name} loading="lazy" className="w-20 h-20 pixelated relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">#{record.pokemon.id.toString().padStart(3, '0')}</span>
                        <Sparkles size={10} className="text-yellow-500" />
                      </div>
                      <h4 className="text-xl font-black uppercase italic text-white truncate">{record.pokemon.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Gamepad2 size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{t(record.game.name)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.encounters')}</span>
                      <div className="text-lg font-black text-white italic">{record.encounters}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t('shinyHunting.date')}</span>
                      <div className="text-sm font-black text-slate-300 italic flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">"{record.notes}"</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Pokemon Selector Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t('shinyHunting.pokemonDatabase')}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('shinyHunting.selectObjective')}</p>
                </div>
                <button 
                  onClick={() => setIsSelectorOpen(false)}
                  className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                  <input 
                    type="text"
                    placeholder={t('shinyHunting.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-3xl pl-14 pr-6 py-5 text-xl font-bold focus:ring-4 focus:ring-red-500/20 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {isGameDexLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('shinyHunting.syncing')}</div>
                  ) : isPokemonListLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('shinyHunting.loading')}</div>
                  ) : filteredPokemon.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('shinyHunting.noPokemon')}</div>
                  ) : filteredPokemon.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPokemon(p);
                        setIsSelectorOpen(false);
                      }}
                      className={`group p-4 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
                        selectedPokemon?.id === p.id 
                        ? 'bg-red-600 border-red-500 shadow-xl shadow-red-900/40' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="w-20 h-20 bg-slate-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <img src={p.sprite} alt={p.name} loading="lazy" className="w-16 h-16 pixelated" />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 block mb-1">#{p.id.toString().padStart(3, '0')}</span>
                        <span className="text-sm font-black uppercase italic truncate w-full block">{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-8">
        <AdBanner type="horizontal" className="mx-auto" />
      </div>

      <style>{`
        .pixelated {
          image-rendering: pixelated;
        }
        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 20px;
          border: 2px solid #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

