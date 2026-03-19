import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import AdBanner from '../components/AdBanner';
import { User, Camera, Shield, Heart, Edit3, Save, X, Sparkles, Trophy, Calendar, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { usePokemonData } from '../hooks/usePokemonData';
import { PersonalPokedex, Pokemon } from '../types';

const AVATARS = Array.from({ length: 50 }, (_, i) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/${i + 1}.png`);

const FORBIDDEN_WORDS = ['scemo', 'stupido', 'cazzo', 'merda', 'vaffanculo', 'idiota', 'bastardo', 'stronzo'];

const validateName = (name: string) => {
  const lowerName = name.toLowerCase();
  return !FORBIDDEN_WORDS.some(word => lowerName.includes(word));
};

export default function Profile() {
  const { t } = useTranslation();
  const { user, sendVerificationEmail, deleteAccount } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { data: pokedexes } = usePokemonData<PersonalPokedex>('pokedexes');
  
  const THEME_COLORS = [
    { name: t('profile.colors.pokeRed'), value: '#ef4444' },
    { name: t('profile.colors.sapphireBlue'), value: '#3b82f6' },
    { name: t('profile.colors.emeraldGreen'), value: '#10b981' },
    { name: t('profile.colors.pikachuYellow'), value: '#eab308' },
    { name: t('profile.colors.masterPurple'), value: '#8b5cf6' },
    { name: t('profile.colors.umbreonBlack'), value: '#1e293b' },
    { name: t('profile.colors.mewPink'), value: '#f472b6' },
    { name: t('profile.colors.charizardOrange'), value: '#f97316' },
  ];
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [pokemonAvatars, setPokemonAvatars] = useState<string[]>([]);
  const [isSearchingFav, setIsSearchingFav] = useState(false);
  const [favSearch, setFavSearch] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({ ...profile });
    }
  }, [profile]);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await res.json();
        const formatted = data.results.map((p: any, index: number) => ({
          id: index + 1,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`
        }));
        setPokemonList(formatted);
        
        // Pick some popular pokemon for avatars
        const popularIds = [1, 4, 7, 25, 133, 150, 151, 249, 250, 384, 448, 493];
        setPokemonAvatars(popularIds.map(id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`));
      } catch (error) {
        console.error('Error fetching pokemon:', error);
      }
    };
    fetchPokemon();
  }, []);

  const stats = useMemo(() => {
    let totalCaught = 0;
    pokedexes.forEach(dex => {
      totalCaught += Object.values(dex.caughtData || {}).filter(c => c.caught).length;
    });
    return {
      totalCaught,
      totalDexes: pokedexes.length
    };
  }, [pokedexes]);

  const filteredPokemon = useMemo(() => {
    return pokemonList.filter(p => p.name.toLowerCase().includes(favSearch.toLowerCase())).slice(0, 20);
  }, [pokemonList, favSearch]);

  const favoritePokemon = useMemo(() => {
    return profile?.favoritePokemon;
  }, [profile?.favoritePokemon]);

  const handleSave = async () => {
    setSaveError('');
    if (!validateName(editData.displayName)) {
      setSaveError(t('profile.forbiddenWordsError'));
      return;
    }
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  const handleReloadUser = async () => {
    if (!user) return;
    setIsReloading(true);
    try {
      await user.reload();
      // Force a re-render by updating state if needed, but Firebase Auth listener should handle it
      window.location.reload(); // Simplest way to refresh the whole state
    } catch (error) {
      console.error('Error reloading user:', error);
    } finally {
      setIsReloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      alert(t('auth.operationFailed'));
    }
  };

  if (!user) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800">
          <Shield size={40} className="text-slate-500" />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{t('profile.loginRequired')}</h2>
        <p className="text-slate-400 max-w-md mb-8 font-bold">{t('profile.loginRequiredDesc')}</p>
      </div>
    );
  }

  if (profileLoading || !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-black uppercase italic tracking-widest">{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
      {/* Profile Header Card */}
      <div className="relative mb-12">
          <div id="profile-header-background" 
            className="h-48 rounded-t-[40px] shadow-2xl overflow-hidden relative"
            style={{ backgroundColor: profile.themeColor || '#ef4444' }}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="absolute top-6 right-8 flex gap-2">
              {!isEditing ? (
                <button 
                  id="edit-profile-button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <Edit3 size={14} /> {t('profile.edit')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    id="cancel-edit-button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-900/70 transition-all"
                  >
                    {t('profile.cancel')}
                  </button>
                  <button 
                    id="save-profile-button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-white text-slate-900 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <Save size={14} /> {t('profile.save')}
                  </button>
                </div>
              )}
            </div>
          </div>

        <div className="px-8 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="relative">
                <div id="profile-avatar-container" className="w-40 h-40 rounded-[40px] bg-slate-900 border-8 border-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
                  {(isEditing ? editData.photoURL : profile.photoURL) ? (
                    <img 
                      id="profile-avatar-image"
                      src={isEditing ? editData.photoURL : profile.photoURL || ''} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={64} className="text-slate-700" />
                  )}
                </div>
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={editData.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        className="bg-transparent border-b-2 border-white/30 focus:border-white outline-none w-full"
                      />
                      {saveError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{saveError}</p>}
                    </div>
                  ) : profile.displayName}
                </h1>
                <Sparkles className="text-yellow-500" size={24} />
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {t('profile.since')} {new Date(profile.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customization */}
        <div className="lg:col-span-2 space-y-8">

          {/* Verification Status */}
          {!user.emailVerified && (
            <section id="verification-warning-section" className="bg-red-950/20 border border-red-900/50 rounded-[32px] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{t('profile.verification.unverified')}</h4>
                    <p className="text-xs font-bold text-red-400">{t('profile.verification.unverifiedDesc')}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    id="resend-verification-button"
                    onClick={handleResendVerification}
                    disabled={verificationSent}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all ${verificationSent ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
                  >
                    {verificationSent ? t('profile.verification.sent') : t('profile.verification.resend')}
                  </button>
                </div>
              </div>
            </section>
          )}
          {user.emailVerified && (
            <section id="verification-success-section" className="bg-emerald-950/20 border border-emerald-900/50 rounded-[32px] p-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{t('profile.verification.verified')}</h4>
                  <p className="text-xs font-bold text-emerald-400">{t('profile.verification.verifiedDesc')}</p>
                </div>
              </div>
            </section>
          )}

          {/* Customization Options (Only while editing) */}
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                {/* Avatar Selection */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                  <h3 className="text-xs font-black uppercase italic text-slate-500 tracking-widest mb-6">{t('profile.chooseAvatar')}</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase italic text-slate-600 tracking-widest mb-3">{t('profile.trainers')}</p>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {AVATARS.map((url, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setEditData({ ...editData, photoURL: url })}
                            className={`aspect-square rounded-2xl border-2 transition-all p-2 flex items-center justify-center ${editData.photoURL === url ? 'border-red-600 bg-red-600/10 scale-110' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                          >
                            <img 
                              src={url} 
                              alt="Trainer Avatar" 
                              className="max-w-full max-h-full object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase italic text-slate-600 tracking-widest mb-3">{t('profile.pokemon')}</p>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {pokemonAvatars.map((url, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setEditData({ ...editData, photoURL: url })}
                            className={`aspect-square rounded-2xl border-2 transition-all p-2 flex items-center justify-center ${editData.photoURL === url ? 'border-red-600 bg-red-600/10 scale-110' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
                          >
                            <img 
                              src={url} 
                              alt="Pokemon Avatar" 
                              className="max-w-full max-h-full object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Theme Color Selection */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8">
                  <h3 className="text-xs font-black uppercase italic text-slate-500 tracking-widest mb-6">{t('profile.themeColor')}</h3>
                  <div className="flex flex-wrap gap-4">
                    {THEME_COLORS.map((color) => (
                      <button 
                        key={color.value}
                        onClick={() => setEditData({ ...editData, themeColor: color.value })}
                        className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${editData.themeColor === color.value ? 'border-white bg-white text-slate-900 scale-105' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }}></div>
                        {color.name}
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Section */}
          <div id="profile-stats-container" className="grid grid-cols-2 gap-4">
            <div id="stat-caught-pokemon" className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 text-center">
              <Trophy className="text-yellow-500 mx-auto mb-4" size={32} />
              <p className="text-4xl font-black italic tracking-tighter text-white mb-1">{stats.totalCaught}</p>
              <p className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">{t('profile.stats.caught')}</p>
            </div>
            <div id="stat-pokedexes" className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 text-center">
              <BookOpen className="text-blue-500 mx-auto mb-4" size={32} />
              <p className="text-4xl font-black italic tracking-tighter text-white mb-1">{stats.totalDexes}</p>
              <p className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">{t('profile.stats.dexes')}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Favorite Pokemon */}
        <div id="favorite-pokemon-column" className="space-y-8">
          <section id="favorite-pokemon-section" className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <h3 className="text-xs font-black uppercase italic text-slate-500 tracking-widest mb-8 flex items-center gap-2">
              <Heart size={14} className="text-red-500" /> {t('profile.favoritePokemon')}
            </h3>

            <div className="text-center">
              {favoritePokemon ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="w-48 h-48 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center relative group">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${favoritePokemon.id}.png`} 
                      alt={favoritePokemon.name}
                      className="w-40 h-40 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{favoritePokemon.name}</h4>
                    <p className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">#{favoritePokemon.id.toString().padStart(3, '0')}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 text-slate-500 italic font-bold">
                  {t('profile.noFavorite')}
                </div>
              )}

              {isEditing && (
                <button 
                  onClick={() => setIsSearchingFav(true)}
                  className="mt-8 w-full py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl text-xs font-black uppercase italic tracking-widest text-slate-300 hover:border-red-600 hover:text-white transition-all"
                >
                  {t('profile.changeFavorite')}
                </button>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          <section id="danger-zone-section" className="bg-red-950/10 border border-red-900/30 rounded-[32px] p-8">
            <h3 className="text-xs font-black uppercase italic text-red-500/70 tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle size={14} /> {t('profile.dangerZone')}
            </h3>
            <button 
              id="delete-account-trigger"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-4 bg-transparent border-2 border-red-900/30 text-red-500 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> {t('profile.deleteAccount')}
            </button>
          </section>
        </div>
      </div>

      {/* Favorite Search Modal */}
      <AnimatePresence>
        {isSearchingFav && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchingFav(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">{t('profile.chooseCompanion')}</h2>
                  <button onClick={() => setIsSearchingFav(false)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <input 
                  type="text"
                  value={favSearch}
                  onChange={(e) => setFavSearch(e.target.value)}
                  placeholder={t('profile.searchPokemon')}
                  className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:border-red-600 outline-none text-white font-bold mb-6"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPokemon.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setEditData({ 
                          ...editData, 
                          favoritePokemon: {
                            id: p.id,
                            name: p.name,
                            sprite: p.sprite
                          } 
                        });
                        setIsSearchingFav(false);
                      }}
                      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:border-red-600 hover:bg-red-600/10 transition-all group"
                    >
                      <img 
                        src={p.sprite} 
                        alt={p.name} 
                        className="w-16 h-16 mx-auto group-hover:scale-110 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[10px] font-black uppercase italic text-slate-400 mt-2 truncate">{p.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-red-900/30 rounded-[40px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                <Trash2 size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">{t('profile.deleteAccount')}</h2>
              <p className="text-slate-400 font-bold mb-8 leading-relaxed">
                {t('profile.deleteAccountConfirm')}
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  id="confirm-delete-button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isDeleting ? '...' : t('profile.deleteAccountButton')}
                </button>
                <button 
                  id="cancel-delete-button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-700 transition-all"
                >
                  {t('profile.cancel')}
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
          <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">{t('sponsored')}</span>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <AdBanner type="horizontal" className="mx-auto" />
      </div>
    </div>
  );
}
