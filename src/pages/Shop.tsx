import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import AdBanner from '../components/AdBanner';

interface AffiliateProduct {
  id: string;
  name: string;
  category: 'games' | 'cards' | 'merch' | 'books';
  price: string;
  image: string;
  affiliateUrl: string;
  description: string;
  isHot?: boolean;
}

const PRODUCTS: AffiliateProduct[] = [
  {
    id: '1',
    name: 'shop.products.arceus.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/47d6C6G',
    description: 'shop.products.arceus.desc'
  },
  {
    id: '2',
    name: 'shop.products.violet.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4bnno5u',
    description: 'shop.products.violet.desc'
  },
  {
    id: '3',
    name: 'shop.products.za.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/3Plnmm3',
    description: 'shop.products.za.desc'
  },
  {
    id: '4',
    name: 'shop.products.za2.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4rDoQpn',
    description: 'shop.products.za2.desc'
  },
  {
    id: '5',
    name: 'shop.products.bd.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4uDRbOZ',
    description: 'shop.products.bd.desc'
  },
  {
    id: '6',
    name: 'shop.products.lgp.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/475zRbC',
    description: 'shop.products.lgp.desc'
  },
  {
    id: '7',
    name: 'shop.products.ul.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4bvbDc0',
    description: 'shop.products.ul.desc'
  },
  {
    id: '8',
    name: 'shop.products.sun.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4slPJ1Z',
    description: 'shop.products.sun.desc'
  },
  {
    id: '9',
    name: 'shop.products.lge.name',
    category: 'games',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4uF0yhl',
    description: 'shop.products.lge.desc'
  },
  {
    id: '10',
    name: 'shop.products.switch2.name',
    category: 'merch',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4blYG5C',
    description: 'shop.products.switch2.desc'
  },
  {
    id: '11',
    name: 'shop.products.switch.name',
    category: 'merch',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4lOuPWX',
    description: 'shop.products.switch.desc'
  },
  {
    id: '12',
    name: 'shop.products.oled.name',
    category: 'merch',
    price: '',
    image: '',
    affiliateUrl: 'https://amzn.to/4sXeRfv',
    description: 'shop.products.oled.desc'
  }
];

export default function Shop() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <Helmet>
        <title>Shop - Trainer's Log | Pokémon Games, Cards & Merch</title>
        <meta name="description" content="Browse our curated selection of Pokémon games, trading cards, and exclusive merchandise. Support Trainer's Log by shopping through our affiliate links." />
        <meta name="keywords" content="Pokémon Shop, Pokémon Games, Pokémon Cards, Pokémon Merch, Pokémon Affiliate, Buy Pokémon Games, Pokémon TCG" />
        <link rel="canonical" href="https://ais-pre-cylpbrmhe3ohvkej472f3a-487008938627.europe-west2.run.app/shop" />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ShoppingBag size={20} />
              <span className="text-xs font-black uppercase italic tracking-widest">{t('shop.navLabel')} Trainer's Log</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
              {t('shop.title')} <span className="text-red-600">{t('shop.subtitle')}</span>
            </h2>
            <p className="text-slate-400 font-bold mt-4 max-w-xl">
              {t('shop.desc')}
            </p>
          </div>
        </div>

        {/* Top Ad Banner */}
        <AdBanner className="mb-12" />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden hover:border-red-600/50 transition-all flex flex-col"
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white group-hover:text-red-500 transition-colors">
                    {t(product.name)}
                  </h3>
                  <div className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t(`shop.categories.${product.category}`)}</span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8 flex-grow">
                  {t(product.description)}
                </p>

                <a 
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-800 hover:bg-red-600 text-white font-black uppercase italic tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-black/20"
                >
                  {t('shop.viewOnAmazon')}
                  <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Ad Banner */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-grow bg-slate-800"></div>
            <span className="text-[10px] font-black uppercase italic text-slate-600 tracking-[0.2em]">{t('sponsored')}</span>
            <div className="h-px flex-grow bg-slate-800"></div>
          </div>
          <AdBanner className="mx-auto" />
        </div>

        {/* Disclaimer */}
        <div className="mt-20 p-8 bg-slate-900/30 border border-slate-800 rounded-[32px] text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
            {t('shop.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
