import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8 py-16 text-slate-300">
      <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8">{t('privacy.title')}</h1>
      <div className="space-y-6 leading-relaxed">
        <p>
          {t('privacy.welcome')}
        </p>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('privacy.section1.title')}</h2>
          <p>
            {t('privacy.section1.content')}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('privacy.section2.title')}</h2>
          <p>
            {t('privacy.section2.content')}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('privacy.section3.title')}</h2>
          <p>
            {t('privacy.section3.content')}
          </p>
        </section>
      </div>
    </div>
  );
}
