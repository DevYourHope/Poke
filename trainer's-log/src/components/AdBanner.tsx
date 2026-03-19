import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  type?: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

export default function AdBanner({ type = 'horizontal', className = '' }: AdBannerProps) {
  const dimensions = {
    horizontal: 'w-full h-24 md:h-32',
    vertical: 'w-64 h-[600px]',
    square: 'w-full aspect-square max-w-[300px]'
  };

  return (
    <div className={`relative bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center group transition-all hover:bg-slate-800/60 ${dimensions[type]} ${className}`}>
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-800/80 rounded text-[8px] font-black uppercase tracking-widest text-slate-500 z-10">
        Annuncio
      </div>
      
      {/* Google AdSense Slot */}
      <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ 
        __html: `
          <ins class="adsbygoogle"
               style="display:block;width:100%;height:100%"
               data-ad-client="ca-pub-8656067199780451"
               data-ad-slot="auto"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        ` 
      }} />
    </div>
  );
}
