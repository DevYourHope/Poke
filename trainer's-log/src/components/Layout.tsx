import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  const { user, login, loginEmail, signUp, logout, loading, resetPassword } = useAuth();
  const { profile } = useUserProfile();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'it' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    try {
      if (authMode === 'login') {
        await loginEmail(email, password);
        setShowAuthModal(false);
      } else if (authMode === 'signup') {
        await signUp(email, password, name);
        setAuthMessage(t('auth.accountCreated'));
        setAuthMode('login');
      } else if (authMode === 'forgot') {
        await resetPassword(email);
        setAuthMessage(t('auth.resetSent'));
        setAuthMode('login');
      }
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it or use Google Login.');
      } else {
        setAuthError(err.message || t('auth.operationFailed'));
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await login();
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || t('googleLoginFailed'));
    }
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
            <button
              onClick={toggleLanguage}
              className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 bg-slate-800/50 rounded-xl border border-slate-700"
              title={i18n.language === 'en' ? t('switchToItalian') : t('switchToEnglish')}
            >
              <Globe size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{i18n.language}</span>
            </button>

            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-black uppercase tracking-tighter text-white">
                      {profile?.displayName || user.displayName || t('defaultTrainerName')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('connected')}</span>
                  </div>
                  <Link to="/profile">
                    {profile?.photoURL ? (
                      <img 
                        src={profile.photoURL} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border border-slate-700 hover:border-red-500 transition-colors object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:border-red-500 transition-colors">
                        <UserIcon size={16} className="text-slate-400" />
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title={t('logout')}
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all border border-slate-700"
                  >
                    <LogIn size={16} />
                    {t('login')}
                  </button>
              )
            )}

            <div className="lg:hidden">
              <button className="p-2 text-slate-400 hover:text-white">
                <span className="sr-only">Menu</span>
                <div className="w-6 h-0.5 bg-current mb-1.5"></div>
                <div className="w-6 h-0.5 bg-current mb-1.5"></div>
                <div className="w-6 h-0.5 bg-current"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                    {authMode === 'login' ? t('auth.welcomeBack') : authMode === 'signup' ? t('auth.newTrainer') : t('auth.resetPassword')}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthMode('login');
                      setAuthError('');
                      setAuthMessage('');
                    }}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-black uppercase italic text-slate-500 mb-1.5 ml-1">{t('auth.name')}</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:border-red-600 focus:outline-none transition-colors font-bold text-white"
                        placeholder={t('auth.yourName')}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-black uppercase italic text-slate-500 mb-1.5 ml-1">{t('auth.email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:border-red-600 focus:outline-none transition-colors font-bold text-white"
                      placeholder={t('auth.emailPlaceholder')}
                    />
                  </div>
                  {authMode !== 'forgot' && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-black uppercase italic text-slate-500">{t('auth.password')}</label>
                        {authMode === 'login' && (
                          <button 
                            type="button"
                            onClick={() => setAuthMode('forgot')}
                            className="text-[10px] font-black uppercase italic text-red-500 hover:underline"
                          >
                            {t('auth.forgotPassword')}
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl focus:border-red-600 focus:outline-none transition-colors font-bold text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  {authError && (
                    <p className="text-sm font-bold text-red-500 bg-red-950/20 border border-red-900/50 p-3 rounded-xl">{authError}</p>
                  )}
                  {authMessage && (
                    <p className="text-sm font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl">{authMessage}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                  >
                    {authMode === 'login' ? t('auth.loginButton') : authMode === 'signup' ? t('auth.signupButton') : t('auth.resetButton')}
                  </button>
                </form>

                {authMode !== 'forgot' && (
                  <>
                    <div className="mt-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase font-black italic text-slate-500">
                        <span className="bg-slate-900 px-4">{t('auth.or')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      className="mt-6 w-full py-4 bg-slate-800 border-2 border-slate-700 text-white font-black uppercase italic tracking-widest rounded-2xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                      {t('auth.continueWithGoogle')}
                    </button>
                  </>
                )}

                <p className="mt-8 text-center text-sm font-bold text-slate-400">
                  {authMode === 'login' ? t('auth.noAccount') : authMode === 'signup' ? t('auth.haveAccount') : t('auth.backTo')}
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    {authMode === 'login' ? t('auth.registerNow') : t('login')}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-slate-900/50 border-t border-slate-800 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
          <div className="flex items-center gap-4">
            <span>PokéBook</span>
            {user && <span className="text-emerald-500">• {t('cloudSyncActive')}</span>}
            {!user && <span className="text-yellow-500">• {t('guestMode')}</span>}
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
