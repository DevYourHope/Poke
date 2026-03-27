import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function TermsAndConditions() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-8 py-16 text-slate-300">
      <Helmet>
        <title>{t('terms.title')} | Trainer's Log</title>
        <meta name="description" content={t('terms.welcome')} />
        <link rel="canonical" href="https://ais-pre-cylpbrmhe3ohvkej472f3a-487008938627.europe-west2.run.app/terms-and-conditions" />
      </Helmet>
      <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-8">{t('terms.title')}</h1>
      <div className="space-y-6 leading-relaxed">
        <p>
          {t('terms.welcome')}
        </p>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('terms.section1.title')}</h2>
          <p>
            {t('terms.section1.content')}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('terms.section2.title')}</h2>
          <p>
            {t('terms.section2.content')}
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white uppercase mb-3">{t('terms.section3.title')}</h2>
          <p>
            {t('terms.section3.content')}
          </p>
        </section>
      </div>
    </div>
  );
}
