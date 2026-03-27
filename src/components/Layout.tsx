import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './AuthModal';
import { Home, Target, BookOpen, Users, LogIn, LogOut, User as UserIcon, X, ShoppingBag, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const { profile } = useUserProfile();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'it' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: '/', label: t('home.navLabel'), icon: Home },
    { path: '/shiny-hunting', label: t('shinyHunting.navLabel'), icon: Target },
    { path: '/pokedex', label: t('pokedex.navLabel'), icon: BookOpen },
    { path: '/team', label: t('teamAnalyzer.navLabel'), icon: Users },
    { path: '/custom-games', label: t('customGames.navLabel'), icon: Target },
    { path: '/shop', label: t('shop.navLabel'), icon: ShoppingBag },
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
               Trainer's <span className="text-red-500">log</span>
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

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-800/50 rounded-xl border border-slate-700"
                title={i18n.language === 'en' ? t('switchToItalian') : t('switchToEnglish')}
              >
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{i18n.language}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-tighter text-white">
                    {profile?.displayName || t('defaultTrainerName')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user ? t('cloudSave') : t('localSave')}</span>
                </div>
                <Link to="/profile">
                  {profile?.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border border-slate-700 hover:border-red-500 transition-colors object-contain bg-slate-800/50" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:border-red-500 transition-colors">
                      <UserIcon size={20} className="text-slate-400" />
                    </div>
                  )}
                </Link>
                {!user && (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-xl border border-slate-700"
                    title={t('auth.loginButton')}
                  >
                    <LogIn size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-xl border border-slate-700"
                aria-label="Open Menu"
              >
                <div className="flex flex-col gap-1.5 w-6">
                  <div className="w-full h-0.5 bg-current rounded-full"></div>
                  <div className="w-full h-0.5 bg-current rounded-full"></div>
                  <div className="w-full h-0.5 bg-current rounded-full"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-grow">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest transition-all flex items-center gap-4 ${
                        isActive 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col gap-4">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-4 text-slate-400 hover:text-white transition-colors flex items-center justify-between bg-slate-800/50 rounded-2xl border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">{t('language')}</span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">{i18n.language}</span>
                </button>

                <div className="flex flex-col gap-2">
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 bg-slate-800 rounded-2xl border border-slate-700"
                  >
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <UserIcon size={20} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tighter text-white">
                        {profile?.displayName || t('defaultTrainerName')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user ? t('cloudSave') : t('localSave')}</span>
                    </div>
                  </Link>
                  {!user ? (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={16} /> {t('auth.loginButton')}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full p-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> {t('auth.logoutButton')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {children}
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Footer / Status Bar */}
      <footer className="bg-slate-900/50 border-t border-slate-800 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
          <div className="flex items-center gap-4">
            <span>Trainer's Log</span>
            <span className={user ? "text-emerald-500" : "text-yellow-500"}>
              • {user ? t('netlifySyncActive') : t('localSaveActive')}
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">{t('termsConditions')}</Link>
          </div>
          <div className="max-w-md opacity-60">
            {t('copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}
