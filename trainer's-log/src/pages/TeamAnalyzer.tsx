import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import AdBanner from '../components/AdBanner';
import { Plus, Trash2, Search, Sparkles, Shield, Zap, Info, Users, ChevronRight, AlertTriangle, Gamepad2, BrainCircuit, Loader2, Save, Edit2, FolderOpen, Wand2 } from 'lucide-react';
import { Pokemon, TeamMember, Game, Team } from '../types';
import { GAMES } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from 'react-markdown';

const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fighting: 2, poison: 0.5, steel: 0.5, dragon: 2, dark: 2, fire: 0.5 },
};

const TYPES = Object.keys(TYPE_CHART);

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-slate-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  grass: 'bg-emerald-500',
  electric: 'bg-yellow-400',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-stone-600',
  ghost: 'bg-violet-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-stone-800',
  steel: 'bg-slate-500',
  fairy: 'bg-pink-300',
};

export default function TeamAnalyzer() {
  const { t } = useTranslation();
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>(GAMES);
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarterModalOpen, setIsStarterModalOpen] = useState(false);
  const [gamePokemonIds, setGamePokemonIds] = useState<number[] | null>(null);
  const [isGameDexLoading, setIsGameDexLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'casual' | 'pro'>('casual');
  const [editingTeamName, setEditingTeamName] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 50;

  const currentTeam = useMemo(() => {
    return allTeams.find(t => t.id === activeTeamId) || null;
  }, [allTeams, activeTeamId]);

  const team = currentTeam?.members || [];

  useEffect(() => {
    const savedGames = localStorage.getItem('rotomdex_custom_games');
    let allGames = GAMES;
    if (savedGames) {
      const custom: Game[] = JSON.parse(savedGames);
      const hydratedCustom = custom.map(g => {
        if (!g.maxNationalId && g.pokedex) {
          const base = GAMES.find(bg => bg.pokedex === g.pokedex);
          if (base) return { ...g, maxNationalId: base.maxNationalId };
        }
        return g;
      });
      allGames = [...hydratedCustom, ...GAMES];
      setAvailableGames(allGames);
    }

    const lastGameId = localStorage.getItem('rotomdex_last_team_game') || localStorage.getItem('auradex_last_team_game');
    const gameToLoad = allGames.find(g => g.id === lastGameId) || allGames[0];
    setSelectedGame(gameToLoad);

    const savedTeams = localStorage.getItem('rotomdex_teams') || localStorage.getItem('auradex_all_teams');
    if (savedTeams) {
      const teams: Team[] = JSON.parse(savedTeams);
      setAllTeams(teams);
      
      const lastTeamId = localStorage.getItem('rotomdex_last_active_team') || localStorage.getItem('auradex_last_active_team');
      if (lastTeamId && teams.find(t => t.id === lastTeamId)) {
        setActiveTeamId(lastTeamId);
      } else if (teams.length > 0) {
        setActiveTeamId(teams[0].id);
      }
    } else {
      // Create initial team if none exists
      const initialTeam: Team = {
        id: `team-${Date.now()}`,
        name: `${t('teamAnalyzer.team')} 1`,
        gameId: gameToLoad.id,
        members: [],
        createdAt: Date.now()
      };
      setAllTeams([initialTeam]);
      setActiveTeamId(initialTeam.id);
      localStorage.setItem('rotomdex_teams', JSON.stringify([initialTeam]));
    }

    const fetchPokemon = async () => {
      const CACHE_KEY = 'pokeapi_pokemon_list_all';
      const CACHE_TIME_KEY = 'pokeapi_pokemon_list_all_time';
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
        setPokemonList(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025', { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await res.json();
        const formatted = data.results.map((p: any, index: number) => ({
          id: index + 1,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
          shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${index + 1}.png`,
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

        setPokemonList(formatted);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
        if (cachedData) {
          setPokemonList(JSON.parse(cachedData));
        }
        setIsLoading(false);
      }
    };
    fetchPokemon();
  }, []);

  const saveAllTeams = (teams: Team[]) => {
    setAllTeams(teams);
    localStorage.setItem('rotomdex_teams', JSON.stringify(teams));
  };

  const updateCurrentTeam = (members: TeamMember[]) => {
    const updatedTeams = allTeams.map(t => 
      t.id === activeTeamId ? { ...t, members } : t
    );
    saveAllTeams(updatedTeams);
  };

  const createNewTeam = () => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `${t('teamAnalyzer.team')} ${allTeams.length + 1}`,
      gameId: selectedGame.id,
      members: [],
      createdAt: Date.now()
    };
    const updatedTeams = [...allTeams, newTeam];
    saveAllTeams(updatedTeams);
    setActiveTeamId(newTeam.id);
    localStorage.setItem('rotomdex_last_active_team', newTeam.id);
    setIsTeamSelectorOpen(false);
  };

  const deleteTeam = (id: string) => {
    if (allTeams.length <= 1) {
      alert(t('teamAnalyzer.atLeastOneTeam'));
      return;
    }
    const updatedTeams = allTeams.filter(t => t.id !== id);
    saveAllTeams(updatedTeams);
    if (activeTeamId === id) {
      setActiveTeamId(updatedTeams[0].id);
      localStorage.setItem('rotomdex_last_active_team', updatedTeams[0].id);
    }
  };

  const renameTeam = (id: string, newName: string) => {
    const updatedTeams = allTeams.map(t => 
      t.id === id ? { ...t, name: newName } : t
    );
    saveAllTeams(updatedTeams);
    setEditingTeamName(null);
  };

  const handleGameChange = (game: Game) => {
    setSelectedGame(game);
    localStorage.setItem('rotomdex_last_team_game', game.id);
    
    // Update current team's gameId if it's empty or if we want to associate it
    if (currentTeam && currentTeam.members.length === 0) {
      const updatedTeams = allTeams.map(t => 
        t.id === activeTeamId ? { ...t, gameId: game.id } : t
      );
      saveAllTeams(updatedTeams);
    }
    
    setIsGameSelectorOpen(false);
    setAnalysisResult(null);
  };

  const generateOptimizedTeam = async (starterName: string) => {
    setIsGenerating(true);
    setIsStarterModalOpen(false);
    setAnalysisResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Get the list of available pokemon for this game to help the AI
      const availablePokemon = pokemonList.filter(p => {
        if (selectedGame.maxNationalId) return p.id <= selectedGame.maxNationalId!;
        if (gamePokemonIds) return gamePokemonIds.includes(p.id);
        return true;
      });
      const availableNames = availablePokemon.map(p => p.name).join(', ');

      const prompt = `Sei un esperto di Pokémon. Genera una squadra ottimizzata di ESATTAMENTE 6 Pokémon per il gioco "${selectedGame.name}" partendo dallo starter "${starterName}".
      
      IMPORTANTE: Usa SOLO Pokémon che sono CATTURABILI o OTTENIBILI in "${selectedGame.name}". 
      Ecco una lista di Pokémon validi per questo gioco: ${availableNames.slice(0, 2000)}${availableNames.length > 2000 ? '...' : ''}
      
      Non includere Pokémon di generazioni successive o non presenti nel Pokédex di questo gioco (massimo ID Pokédex Nazionale: ${selectedGame.maxNationalId || 'N/A'}).
      
      La squadra deve essere bilanciata per affrontare tutti i Capipalestra, i Superquattro e il Campione.
      
      Restituisci SOLO un array JSON di stringhe con i nomi dei 6 Pokémon (in inglese, come appaiono su PokeAPI).
      Includi lo starter scelto nell'array.
      Esempio: ["charizard", "nidoking", "jolteon", "lapras", "snorlax", "dragonite"]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const recommendedNames: string[] = JSON.parse(response.text || "[]");
      
      if (recommendedNames.length === 0) throw new Error(t('teamAnalyzer.generationError'));

      const newTeamMembers: TeamMember[] = [];
      
      // We want exactly 6, so we'll try to find them in our list
      for (const name of recommendedNames) {
        if (newTeamMembers.length >= 6) break;

        // Find in our list (case insensitive and handling potential PokeAPI name differences)
        const found = pokemonList.find(p => 
          p.name.toLowerCase() === name.toLowerCase() || 
          p.name.toLowerCase().replace(' ', '-') === name.toLowerCase()
        );

        if (found) {
          // Check if it's actually in the game's dex if we have the IDs or maxNationalId
          const isInDex = selectedGame.maxNationalId 
            ? found.id <= selectedGame.maxNationalId 
            : (gamePokemonIds ? gamePokemonIds.includes(found.id) : true);

          if (!isInDex) {
            console.warn(`AI suggested ${found.name} which is not in the game dex. Skipping.`);
            continue;
          }

          // Fetch types
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${found.id}`);
          const data = await res.json();
          const types = data.types.map((t: any) => t.type.name);
          
          newTeamMembers.push({
            id: `member-${Date.now()}-${Math.random()}`,
            pokemon: { ...found, types },
            isShiny: false
          });
        }
      }

      // If we don't have 6, we might need to fill or just show what we have
      // But the prompt is strict now.
      if (newTeamMembers.length > 0) {
        updateCurrentTeam(newTeamMembers);
      }
    } catch (error) {
      console.error('Team Generation Error:', error);
      alert(t('teamAnalyzer.generationError'));
    } finally {
      setIsGenerating(false);
    }
  };
  const analyzeWithAI = async () => {
    if (team.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const teamInfo = team.map(m => `${m.pokemon.name} (${m.pokemon.types?.join('/')})`).join(', ');
      
      let prompt = '';
      
      if (analysisMode === 'casual') {
        prompt = t('teamAnalyzer.casualPrompt', { game: selectedGame.name, team: teamInfo });
      } else {
        prompt = t('teamAnalyzer.competitivePrompt', { game: selectedGame.name, team: teamInfo });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAnalysisResult(response.text || t('teamAnalyzer.analysisError'));
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAnalysisResult(t('teamAnalyzer.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToTeam = async (pokemon: Pokemon) => {
    if (team.length >= 6) {
      alert(t('teamAnalyzer.teamFull'));
      return;
    }

    // Fetch types for this specific pokemon
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      const data = await res.json();
      const types = data.types.map((t: any) => t.type.name);
      
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        pokemon: { ...pokemon, types },
        isShiny: false
      };

      updateCurrentTeam([...team, newMember]);
      setIsSelectorOpen(false);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const removeFromTeam = (id: string) => {
    updateCurrentTeam(team.filter(m => m.id !== id));
  };

  const toggleShiny = (id: string) => {
    updateCurrentTeam(team.map(m => m.id === id ? { ...m, isShiny: !m.isShiny } : m));
  };

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
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!");
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
  }, [searchTerm, pokemonList, currentPage, gamePokemonIds, selectedGame]);

  // Analysis Logic
  const analysis = useMemo(() => {
    const defensive: Record<string, number> = {};
    const offensive: Record<string, number> = {};
    
    TYPES.forEach(t => {
      defensive[t] = 0;
      offensive[t] = 0;
    });

    team.forEach(member => {
      const pTypes = member.pokemon.types || [];
      
      // Defensive Analysis (Weaknesses/Resistances)
      TYPES.forEach(attackingType => {
        let multiplier = 1;
        pTypes.forEach(defendingType => {
          const effectiveness = TYPE_CHART[attackingType]?.[defendingType] ?? 1;
          multiplier *= effectiveness;
        });

        if (multiplier > 1) defensive[attackingType] += 1; // Weakness
        if (multiplier < 1) defensive[attackingType] -= 1; // Resistance
      });

      // Offensive Analysis (Coverage)
      pTypes.forEach(pType => {
        TYPES.forEach(defendingType => {
          const effectiveness = TYPE_CHART[pType]?.[defendingType] ?? 1;
          if (effectiveness > 1) offensive[defendingType] += 1;
        });
      });
    });

    return { defensive, offensive };
  }, [team]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex flex-col w-full lg:w-auto gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {editingTeamName !== null ? (
              <input
                type="text"
                defaultValue={currentTeam?.name}
                onBlur={(e) => renameTeam(activeTeamId!, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && renameTeam(activeTeamId!, e.currentTarget.value)}
                className="bg-slate-900 border-b-2 border-blue-500 text-3xl md:text-5xl font-black uppercase italic outline-none w-full max-w-xs"
                autoFocus
              />
            ) : (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter flex items-center flex-wrap gap-3">
                {currentTeam?.name || t('teamAnalyzer.title')}
                <button 
                  onClick={() => setEditingTeamName(activeTeamId!)}
                  className="p-2 hover:text-blue-500 transition-colors"
                  title={t('teamAnalyzer.rename')}
                >
                  <Edit2 size={20} />
                </button>
              </h2>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 w-full">
            <div className="relative flex-1 min-w-[160px] sm:flex-none">
              <button 
                onClick={() => setIsTeamSelectorOpen(!isTeamSelectorOpen)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} className="text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">{t('teamAnalyzer.team')}</span>
                    <span className="text-xs font-black uppercase italic text-white truncate max-w-[80px] sm:max-w-none block">{currentTeam?.name}</span>
                  </div>
                </div>
                <ChevronRight size={14} className={`text-slate-500 transition-transform ${isTeamSelectorOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isTeamSelectorOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {allTeams.map(t => (
                        <div key={t.id} className="group/item flex items-center">
                          <button
                            onClick={() => {
                              setActiveTeamId(t.id);
                              localStorage.setItem('rotomdex_last_active_team', t.id);
                              setIsTeamSelectorOpen(false);
                            }}
                            className={`flex-1 px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center justify-between ${activeTeamId === t.id ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-400'}`}
                          >
                            <span className="text-[10px] font-black uppercase italic">{t.name}</span>
                            {activeTeamId === t.id && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                          </button>
                          <button 
                            onClick={() => deleteTeam(t.id)}
                            className="p-3 text-slate-600 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={createNewTeam}
                      className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-emerald-500 font-black uppercase italic text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={12} />
                      {t('teamAnalyzer.newTeam')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-1 min-w-[160px] sm:flex-none">
              <button 
                onClick={() => setIsGameSelectorOpen(!isGameSelectorOpen)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 size={18} className="text-blue-500 shrink-0" />
                  <div className="text-left">
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">{t('teamAnalyzer.game')}</span>
                    <span className="text-xs font-black uppercase italic text-white truncate max-w-[80px] sm:max-w-none block">{selectedGame.name}</span>
                  </div>
                </div>
                <ChevronRight size={14} className={`text-slate-500 transition-transform ${isGameSelectorOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isGameSelectorOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {availableGames.map(game => (
                        <button
                          key={game.id}
                          onClick={() => handleGameChange(game)}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center justify-between ${selectedGame.id === game.id ? 'bg-blue-600/10 text-blue-500' : 'text-slate-400'}`}
                        >
                          <span className="text-[10px] font-black uppercase italic">{game.name}</span>
                          {selectedGame.id === game.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 overflow-hidden shrink-0">
            <button
              onClick={() => setAnalysisMode('casual')}
              className={`px-4 sm:px-6 py-2 min-w-[70px] sm:min-w-[80px] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${analysisMode === 'casual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t('teamAnalyzer.casual')}
            </button>
            <button
              onClick={() => setAnalysisMode('pro')}
              className={`px-4 sm:px-6 py-2 min-w-[70px] sm:min-w-[80px] rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${analysisMode === 'pro' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t('teamAnalyzer.pro')}
            </button>
          </div>
          
          <div className="flex gap-3 flex-1 sm:flex-none">
            <button 
              onClick={() => setIsStarterModalOpen(true)}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-30 shrink-0 text-xs sm:text-sm hover:border-blue-500 text-blue-500"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
              {t('teamAnalyzer.generate')}
            </button>
            <button 
              onClick={analyzeWithAI}
              disabled={team.length === 0 || isAnalyzing}
              className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-30 shrink-0 text-xs sm:text-sm ${analysisMode === 'casual' ? 'hover:border-blue-500 text-blue-500' : 'hover:border-emerald-500 text-emerald-500'}`}
            >
              {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
              {t('teamAnalyzer.analysis')}
            </button>
            <button 
              onClick={() => setIsSelectorOpen(true)}
              disabled={team.length >= 6}
              className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl shadow-blue-900/20 active:scale-95 shrink-0 text-xs sm:text-sm"
            >
              <Plus size={20} />
              {t('teamAnalyzer.add')}
            </button>
          </div>
        </div>
      </header>

      {analysisResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-slate-900 rounded-[2.5rem] p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit size={120} className="text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t('teamAnalyzer.analysis')} <span className="text-emerald-500">RotomDex</span></h3>
            </div>
            <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed">
              <Markdown>{analysisResult}</Markdown>
            </div>
            <button 
              onClick={() => setAnalysisResult(null)}
              className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              {t('teamAnalyzer.closeAnalysis')}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Team Display */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {team.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 shadow-xl relative group overflow-hidden"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => toggleShiny(member.id)}
                      className={`p-2 rounded-xl transition-all ${member.isShiny ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-yellow-500'}`}
                    >
                      <Sparkles size={16} />
                    </button>
                    <button 
                      onClick={() => removeFromTeam(member.id)}
                      className="p-2 bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 relative">
                      <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${member.isShiny ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                      <img 
                        src={member.isShiny ? member.pokemon.shinySprite : member.pokemon.sprite} 
                        alt={member.pokemon.name} 
                        className="w-24 h-24 pixelated relative z-10 drop-shadow-xl" 
                      />
                    </div>
                    
                    <h4 className="text-xl font-black uppercase italic text-white mb-2">{member.pokemon.name}</h4>
                    
                    <div className="flex gap-2">
                      {member.pokemon.types?.map(t => (
                        <span key={t} className={`${TYPE_COLORS[t]} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {team.length < 6 && Array.from({ length: 6 - team.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  onClick={() => setIsSelectorOpen(true)}
                  className="bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-slate-900/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} className="text-slate-700" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('teamAnalyzer.emptySlot')}</span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Analysis Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
              <Shield size={24} className="text-emerald-400" />
              {t('teamAnalyzer.teamDefense')}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t('teamAnalyzer.weaknesses')}</span>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.filter(t => analysis.defensive[t] > 0).map(t => (
                      <div key={t} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[t]}`}></div>
                        <span className="text-[10px] font-bold uppercase text-slate-300">{t}</span>
                        <span className="text-[10px] font-black text-red-500">x{analysis.defensive[t]}</span>
                      </div>
                    ))}
                    {TYPES.filter(t => analysis.defensive[t] > 0).length === 0 && <span className="text-xs text-slate-600 italic">{t('teamAnalyzer.none')}</span>}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t('teamAnalyzer.resistances')}</span>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.filter(t => analysis.defensive[t] < 0).map(t => (
                      <div key={t} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[t]}`}></div>
                        <span className="text-[10px] font-bold uppercase text-slate-300">{t}</span>
                        <span className="text-[10px] font-black text-emerald-500">x{Math.abs(analysis.defensive[t])}</span>
                      </div>
                    ))}
                    {TYPES.filter(t => analysis.defensive[t] < 0).length === 0 && <span className="text-xs text-slate-600 italic">{t('teamAnalyzer.none')}</span>}
                  </div>
                </div>
              </div>

              {(Object.values(analysis.defensive) as number[]).some(v => v >= 3) && (
                <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-1" />
                  <p className="text-xs font-medium text-red-200 leading-relaxed">
                    Attenzione: La tua squadra ha troppe debolezze comuni. Considera di cambiare un membro per bilanciare la difesa.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
              <Zap size={24} className="text-yellow-400" />
              {t('teamAnalyzer.coverage')}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(t => {
                const count = analysis.offensive[t];
                return (
                  <div key={t} className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${count > 0 ? 'bg-slate-800 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-30'}`}>
                    <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[t]}`}></div>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{t}</span>
                    {count > 0 && <span className="text-xs font-black text-white italic">x{count}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Starter Selection Modal */}
      <AnimatePresence>
        {isStarterModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStarterModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{t('teamAnalyzer.generateTitle')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">{t('teamAnalyzer.generateDesc')}</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => generateOptimizedTeam('Erba')}
                  className="flex items-center gap-4 p-6 bg-emerald-600/10 border border-emerald-600/30 rounded-3xl hover:bg-emerald-600/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black uppercase italic text-emerald-500">Erba</span>
                    <span className="text-[10px] font-bold text-slate-500 block">Strategia e Resistenza</span>
                  </div>
                </button>

                <button 
                  onClick={() => generateOptimizedTeam('Fuoco')}
                  className="flex items-center gap-4 p-6 bg-orange-600/10 border border-orange-600/30 rounded-3xl hover:bg-orange-600/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black uppercase italic text-orange-500">Fuoco</span>
                    <span className="text-[10px] font-bold text-slate-500 block">Potenza e Velocità</span>
                  </div>
                </button>

                <button 
                  onClick={() => generateOptimizedTeam('Acqua')}
                  className="flex items-center gap-4 p-6 bg-blue-600/10 border border-blue-600/30 rounded-3xl hover:bg-blue-600/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black uppercase italic text-blue-500">Acqua</span>
                    <span className="text-[10px] font-bold text-slate-500 block">Versatilità e Controllo</span>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setIsStarterModalOpen(false)}
                className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                {t('teamAnalyzer.cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t('teamAnalyzer.selectPokemon')}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('teamAnalyzer.add')}</p>
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
                    placeholder={t('teamAnalyzer.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-3xl pl-14 pr-6 py-5 text-xl font-bold focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {isGameDexLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('teamAnalyzer.syncing')}</div>
                  ) : isLoading ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('teamAnalyzer.loading')}</div>
                  ) : filteredPokemon.items.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 font-black uppercase italic tracking-widest">{t('shinyHunting.noPokemon')}</div>
                  ) : filteredPokemon.items.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToTeam(p)}
                      className="group p-4 rounded-[2rem] bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700/50 transition-all flex flex-col items-center gap-3"
                    >
                      <div className="w-20 h-20 bg-slate-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <img src={p.sprite} alt={p.name} className="w-16 h-16 pixelated" />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 block mb-1">#{p.id.toString().padStart(3, '0')}</span>
                        <span className="text-sm font-black uppercase italic truncate w-full block">{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {filteredPokemon.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <span className="text-sm font-black italic text-slate-500">{t('teamAnalyzer.page')} {currentPage} / {filteredPokemon.totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(filteredPokemon.totalPages, prev + 1))}
                      disabled={currentPage === filteredPokemon.totalPages}
                      className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
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
