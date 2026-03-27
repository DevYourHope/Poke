import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Key, Chrome, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import auth from '../netlify-auth';

const TRAINER_AVATARS = [
  'red', 'leaf', 'ethan', 'lyra', 'kris', 'brendan', 'may', 'lucas', 'dawn', 'hilbert',
  'hilda', 'nate', 'rosa', 'calem', 'serena', 'elio', 'selene', 'victor', 'gloria',
  'blue', 'silver', 'wally', 'barry', 'cheren', 'bianca', 'hau', 'gladion', 'marnie', 'hop'
].map(name => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { t } = useTranslation();
  const { login, loginEmail, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [step, setStep] = useState(1); // Step 1: Info, Step 2: Avatar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(TRAINER_AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const getAuthErrorMessage = (err: any) => {
    if (typeof err === 'string') return err;
    const code = err.code || err.message || '';
    switch (code) {
      case 'auth/email-already-in-use': return t('auth.errors.emailAlreadyInUse');
      case 'auth/invalid-email': return t('auth.errors.invalidEmail');
      case 'auth/weak-password': return t('auth.errors.weakPassword');
      case 'auth/user-not-found': return t('auth.errors.userNotFound');
      case 'auth/wrong-password': return t('auth.errors.wrongPassword');
      case 'auth/invalid-credential': return t('auth.errors.invalidCredential');
      case 'auth/too-many-requests': return t('auth.errors.tooManyRequests');
      case 'auth/requires-recent-login': return t('auth.errors.requiresRecentLogin');
      default: return err.message || t('auth.errors.generic');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup' && step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await loginEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUp(email, password, name, avatar);
        setSuccess(t('auth.accountCreated'));
        setTimeout(() => {
          setMode('login');
          setStep(1);
        }, 3000);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess(t('auth.resetSent'));
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      login();
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setMode('login');
    setStep(1);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {mode === 'login' ? t('auth.welcomeBack') : 
                   mode === 'signup' ? (step === 1 ? t('auth.newTrainer') : t('profile.chooseAvatar')) : 
                   t('auth.resetPassword')}
                </h2>
                <div className="h-1 w-12 bg-red-600 mt-2 rounded-full"></div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-sm font-bold">
                  <AlertCircle size={18} />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && step === 2 ? (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-red-600 overflow-hidden flex items-center justify-center">
                        <img src={avatar} alt="Selected Avatar" className="w-20 h-20 object-contain" />
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                      {TRAINER_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`p-2 rounded-xl transition-all ${avatar === url ? 'bg-red-600/20 border-2 border-red-600' : 'bg-slate-900 border border-slate-800 hover:border-slate-600'}`}
                        >
                          <img 
                            src={url} 
                            alt={`Avatar ${i}`} 
                            className="w-full h-auto object-contain" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).parentElement?.style.setProperty('display', 'none');
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={16} /> {t('auth.backTo')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? '...' : <><LogIn size={16} /> {t('auth.signupButton')}</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase italic text-slate-500 ml-4 tracking-widest">
                          {t('auth.name')}
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('auth.yourName')}
                            className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase italic text-slate-500 ml-4 tracking-widest">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('auth.emailPlaceholder')}
                          className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 transition-all"
                        />
                      </div>
                    </div>

                    {mode !== 'reset' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-4">
                          <label className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">
                            {t('auth.password')}
                          </label>
                          {mode === 'login' && (
                            <button 
                              type="button"
                              onClick={() => setMode('reset')}
                              className="text-[10px] font-black uppercase italic text-red-500 hover:text-red-400 transition-colors"
                            >
                              {t('auth.forgotPassword')}
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-red-600 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? '...' : (
                        <>
                          {mode === 'login' ? <LogIn size={16} /> : 
                           mode === 'signup' ? <ChevronRight size={16} /> : 
                           <Key size={16} />}
                          {mode === 'login' ? t('auth.loginButton') : 
                           mode === 'signup' ? t('auth.continue') : 
                           t('auth.resetButton')}
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>

              {mode !== 'reset' && step === 1 && (
                <>
                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px flex-grow bg-slate-800"></div>
                    <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-widest">{t('auth.or')}</span>
                    <div className="h-px flex-grow bg-slate-800"></div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Chrome size={16} />
                    {t('auth.continueWithGoogle')}
                  </button>
                </>
              )}

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-xs font-bold">
                  {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setStep(1);
                    }}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    {mode === 'login' ? t('auth.registerNow') : t('auth.loginButton')}
                  </button>
                </p>
                {mode === 'reset' && (
                  <button
                    onClick={() => setMode('login')}
                    className="mt-4 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    {t('auth.backTo')} {t('auth.loginButton')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
