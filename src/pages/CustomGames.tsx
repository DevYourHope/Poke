import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import AdBanner from '../components/AdBanner';
import { Plus, Trash2, Save, Gamepad2, BookOpen } from 'lucide-react';
import { Game } from '../types';
import { GAMES as POKEDEX_OPTIONS } from '../constants';
import { usePokemonData } from '../hooks/usePokemonData';

export default function CustomGames() {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [selectedPokedexIndex, setSelectedPokedexIndex] = useState(0);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);

  const { data: customGames, addItem: addGameToDb, removeItem: removeGameFromDb } = usePokemonData<Game>('customGames');
  
  const SUGGESTED_TEMPLATES = [
    { name: 'Rainbow Gold', pokedex: 'original-johto', baseOdds: 8192, maxNationalId: 251 },
    { name: 'Crystal Clear', pokedex: 'original-johto', baseOdds: 8192, maxNationalId: 251 },
    { name: 'Liquid Crystal', pokedex: 'updated-johto', baseOdds: 8192, maxNationalId: 493 },
    { name: 'Radical Red', pokedex: 'kanto', baseOdds: 4096, maxNationalId: 1025 },
  ];

  const addGame = async () => {
    if (!newName) return;
    const pokedex = POKEDEX_OPTIONS[selectedPokedexIndex];
    const newGame = {
      name: newName,
      baseOdds: pokedex.baseOdds,
      pokedex: pokedex.pokedex,
      maxNationalId: pokedex.maxNationalId,
      isCustom: true
    };
    await addGameToDb(newGame);
    setNewName('');
    setSelectedPokedexIndex(0);
  };

  const addTemplate = async (template: typeof SUGGESTED_TEMPLATES[0]) => {
    const newGame = {
      ...template,
      isCustom: true
    };
    await addGameToDb(newGame);
  };

  const deleteGame = async (id: string) => {
    await removeGameFromDb(id);
    setGameToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Helmet>
        <title>Custom Games - Trainer's Log | Create Your Own Pokémon Version</title>
        <meta name="description" content="Create custom Pokémon game versions to track your progress in ROM hacks, fan games, or specific challenges. Customize your Pokédex and shiny odds." />
        <meta name="keywords" content="Pokémon ROM Hacks, Pokémon Fan Games, Custom Pokémon Games, Pokémon Tracker, Pokémon Challenges" />
        <link rel="canonical" href="https://ais-pre-cylpbrmhe3ohvkej472f3a-487008938627.europe-west2.run.app/custom-games" />
      </Helmet>
      <header className="mb-12">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
          {t('customGames.title')} <span className="text-blue-500">{t('customGames.subtitle')}</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{t('customGames.desc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl h-fit">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
            <Plus size={24} className="text-blue-400" />
            {t('customGames.newVersion')}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('customGames.versionName')}</label>
              <div className="relative">
                <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('customGames.versionNamePlaceholder')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('customGames.referencePokedex')}</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <select 
                  value={selectedPokedexIndex}
                  onChange={(e) => setSelectedPokedexIndex(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {POKEDEX_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={idx}>{t(opt.name)}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 italic font-medium">
                {t('customGames.probabilityDesc', { odds: POKEDEX_OPTIONS[selectedPokedexIndex].baseOdds })}
              </p>
            </div>

            <button 
              onClick={addGame}
              disabled={!newName}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
            >
              {t('customGames.createButton')}
            </button>
          </div>

          {/* Suggested Templates */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t('customGames.suggestedTitle')}</h4>
            <div className="grid grid-cols-1 gap-3">
              {SUGGESTED_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => addTemplate(template)}
                  className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-all group"
                >
                  <div className="text-left">
                    <p className="text-sm font-black uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">{template.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{template.pokedex}</p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                    <Plus size={14} />
                    {t('customGames.addButton')}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 mt-4 italic leading-relaxed">
              {t('customGames.suggestedDesc')}
            </p>
          </div>
        </section>

        {/* List */}
        <section className="space-y-6">
          <h3 className="text-xl font-black flex items-center gap-3 uppercase italic text-slate-400">
            <Save size={24} />
            {t('customGames.yourVersions')}
          </h3>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {customGames.length === 0 ? (
                <div className="py-12 text-center bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800">
                  <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">{t('customGames.noVersions')}</p>
                </div>
              ) : customGames.map((game) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight">{game.name}</h4>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('customGames.pokedexLabel')}: {game.pokedex}</span>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('customGames.probabilityLabel')}: 1/{game.baseOdds}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setGameToDelete(game.id)}
                    className="w-10 h-10 bg-slate-800 hover:bg-red-600/20 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {gameToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGameToDelete(null)}
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
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{t('customGames.deleteConfirmTitle')}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                {t('customGames.deleteConfirmDesc')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setGameToDelete(null)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  {t('customGames.cancel')}
                </button>
                <button 
                  onClick={() => deleteGame(gameToDelete)}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20"
                >
                  {t('customGames.deleteButton')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ad Banner */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-grow bg-slate-800"></div>
          <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">{t('shop.sponsored')}</span>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <AdBanner type="horizontal" className="mx-auto" />
      </div>
    </div>
  );
}
