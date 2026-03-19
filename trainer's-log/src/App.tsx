/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import AdBanner from './components/AdBanner';
import { Search, Users, ChevronRight, Target, BookOpen, ShoppingBag } from 'lucide-react';
import ShinyHunting from './pages/ShinyHunting';
import CustomGames from './pages/CustomGames';
import Pokedex from './pages/Pokedex';
import TeamAnalyzer from './pages/TeamAnalyzer';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

function Home() {
  const { t } = useTranslation();
  const features = [
    { 
      title: t('home.features.shinyHunting.title'), 
      description: t('home.features.shinyHunting.desc'), 
      icon: Target, 
      color: 'bg-yellow-500', 
      hoverShadow: 'hover:shadow-yellow-900/10',
      hoverBorder: 'hover:border-yellow-500/50',
      hoverGradient: 'group-hover:via-yellow-500',
      path: '/shiny-hunting' 
    },
    { 
      title: t('home.features.pokedex.title'), 
      description: t('home.features.pokedex.desc'), 
      icon: BookOpen, 
      color: 'bg-red-500', 
      hoverShadow: 'hover:shadow-red-900/10',
      hoverBorder: 'hover:border-red-500/50',
      hoverGradient: 'group-hover:via-red-500',
      path: '/pokedex' 
    },
    { 
      title: t('home.features.team.title'), 
      description: t('home.features.team.desc'), 
      icon: Users, 
      color: 'bg-blue-500', 
      hoverShadow: 'hover:shadow-blue-900/10',
      hoverBorder: 'hover:border-blue-500/50',
      hoverGradient: 'group-hover:via-blue-500',
      path: '/team' 
    },
    { 
      title: t('home.features.versions.title'), 
      description: t('home.features.versions.desc'), 
      icon: Target, 
      color: 'bg-blue-500', 
      hoverShadow: 'hover:shadow-blue-900/10',
      hoverBorder: 'hover:border-blue-500/50',
      hoverGradient: 'group-hover:via-blue-500',
      path: '/custom-games' 
    },
    { 
      title: t('home.features.shop.title'), 
      description: t('home.features.shop.desc'), 
      icon: ShoppingBag, 
      color: 'bg-emerald-500', 
      hoverShadow: 'hover:shadow-emerald-900/10',
      hoverBorder: 'hover:border-emerald-500/50',
      hoverGradient: 'group-hover:via-emerald-500',
      path: '/shop' 
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
          {t('home.welcome')} <span className="text-red-600">{t('home.trainer')}</span>.
        </h2>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
          {t('home.subtitle')}
        </p>
      </motion.div>

      {/* Small Ad Banner Above Features */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-grow bg-slate-800"></div>
          <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">{t('sponsored')}</span>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <AdBanner type="horizontal" className="mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Link
            key={feature.title}
            to={feature.path}
            className={`group block bg-slate-900 rounded-[2rem] p-8 shadow-2xl ${feature.hoverShadow} transition-all border border-slate-800 ${feature.hoverBorder} relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50 ${feature.hoverGradient} transition-all`}></div>
            
            <div className={`w-14 h-14 ${feature.color} text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight">{feature.title}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">{feature.description}</p>
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-red-500 transition-all">
              <span>{t('home.launchApp')}</span>
              <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Ad Banner */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-grow bg-slate-800"></div>
          <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">{t('sponsored')}</span>
          <div className="h-px flex-grow bg-slate-800"></div>
        </div>
        <AdBanner type="horizontal" className="mx-auto" />
      </div>

      {/* Support Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-20 p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShoppingBag size={120} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
              {t('home.supportTitle')}
            </h3>
            <p className="text-slate-400 font-medium max-w-md">
              {t('home.supportSubtitle')}
            </p>
          </div>
          <Link 
            to="/shop" 
            className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            {t('home.goToShop')} <ChevronRight size={20} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
        <Search size={32} className="text-slate-700" />
      </div>
      <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">{title}</h2>
      <p className="text-slate-400 mb-8 max-w-md font-medium">{t('home.placeholderSubtitle')}</p>
      <Link to="/" className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/20 active:scale-95">
        {t('home.backHome')}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shiny-hunting" element={<ShinyHunting />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/team" element={<TeamAnalyzer />} />
            <Route path="/custom-games" element={<CustomGames />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
