import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
    name: 'Pokémon Leggende: Arceus',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81dY-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/47d6C6G',
    description: 'Esplora la regione di Hisui e cattura Pokémon in tempo reale in questa avventura rivoluzionaria.'
  },
  {
    id: '2',
    name: 'Pokémon Violetto',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81fH-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4bnno5u',
    description: 'Cavalca il leggendario Miraidon e attraversa le terre di Paldea nel futuro dei Pokémon.'
  },
  {
    id: '3',
    name: 'Pokémon Leggende: Z-A',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/71-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/3Plnmm3',
    description: 'Torna a Luminopoli in questa nuova avventura della serie Leggende Pokémon.'
  },
  {
    id: '4',
    name: 'Pokémon Leggende: Z-A (Switch 2)',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/71-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4rDoQpn',
    description: 'Prenota la versione per la prossima console Nintendo.'
  },
  {
    id: '5',
    name: 'Pokémon Diamante Lucente',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81P6p2Xv-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4uDRbOZ',
    description: 'Rivivi l\'emozione di Sinnoh in questo fedele remake del classico per Nintendo DS.'
  },
  {
    id: '6',
    name: 'Pokémon Let\'s Go Pikachu',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81P6p2Xv-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/475zRbC',
    description: 'Torna a Kanto con il tuo compagno Pikachu in questa rivisitazione moderna di Pokémon Giallo.'
  },
  {
    id: '7',
    name: 'Pokémon Ultra Luna',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81fH-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4bvbDc0',
    description: 'Scopri i segreti di Necrozma e viaggia attraverso gli Ultravarchi nella regione di Alola.'
  },
  {
    id: '8',
    name: 'Pokémon Sole',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81P6p2Xv-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4slPJ1Z',
    description: 'Inizia il tuo giro delle isole ad Alola e scopri il potere delle Mosse Z.'
  },
  {
    id: '9',
    name: 'Pokémon Let\'s Go Eevee',
    category: 'games',
    price: '',
    image: 'https://m.media-amazon.com/images/I/81fH-S9-vEL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4uF0yhl',
    description: 'Esplora Kanto con Eevee sulla tua spalla e cattura Pokémon con un nuovo sistema di lancio.'
  },
  {
    id: '10',
    name: 'Nintendo Switch 2 Console',
    category: 'merch',
    price: '',
    image: 'https://m.media-amazon.com/images/I/618S7v-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4blYG5C',
    description: 'La prossima generazione di console Nintendo. Prenota ora!'
  },
  {
    id: '11',
    name: 'Nintendo Switch Console',
    category: 'merch',
    price: '',
    image: 'https://m.media-amazon.com/images/I/618S7v-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4lOuPWX',
    description: 'La console versatile che ti permette di giocare dove vuoi, quando vuoi, con chi vuoi.'
  },
  {
    id: '12',
    name: 'Nintendo Switch OLED',
    category: 'merch',
    price: '',
    image: 'https://m.media-amazon.com/images/I/618S7v-vL._AC_SL1500_.jpg',
    affiliateUrl: 'https://amzn.to/4sXeRfv',
    description: 'Goditi i tuoi giochi preferiti su uno splendido schermo OLED da 7 pollici.'
  }
];

export default function Shop() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ShoppingBag size={20} />
              <span className="text-xs font-black uppercase italic tracking-widest">{t('shop.navLabel')} PokéBook</span>
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
              <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-2 group-hover:text-red-500 transition-colors">
                  {product.name}
                </h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6 flex-grow">
                  {product.description}
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
