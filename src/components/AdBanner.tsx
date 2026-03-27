import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  type?: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ type = 'horizontal', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions = {
    horizontal: 'w-full min-w-[250px] h-24 md:h-32',
    vertical: 'w-64 min-w-[250px] h-[600px]',
    square: 'w-full min-w-[250px] aspect-square max-w-[300px]'
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const pushAd = () => {
      try {
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          const container = containerRef.current;
          if (!container) return;

          const width = container.offsetWidth;
          const isVisible = container.offsetParent !== null;
          
          if (width > 0 && isVisible) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else if (attempts < 15) {
            attempts++;
            timeoutId = setTimeout(pushAd, 500); // Increased delay for better stability
          }
        }
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    };

    timeoutId = setTimeout(pushAd, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center group transition-all hover:bg-slate-800/60 ${dimensions[type]} ${className}`}
    >
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-800/80 rounded text-[8px] font-black uppercase tracking-widest text-slate-500 z-10">
        Annuncio
      </div>
      
      {/* Google AdSense Slot */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minWidth: '250px', height: '100%' }}
          data-ad-client="ca-pub-8656067199780451"
          data-ad-slot="8183236870"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
