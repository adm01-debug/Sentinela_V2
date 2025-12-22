import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { i18nConfig } from './config';

import enUS from '../locales/en-US.json';
import ptBR from '../locales/pt-BR.json';
import esES from '../locales/es-ES.json';
import frFR from '../locales/fr-FR.json';
import deDE from '../locales/de-DE.json';
import itIT from '../locales/it-IT.json';
import jaJP from '../locales/ja-JP.json';
import zhCN from '../locales/zh-CN.json';

const resources = {
  'en-US': { translation: enUS },
  'pt-BR': { translation: ptBR },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'de-DE': { translation: deDE },
  'it-IT': { translation: itIT },
  'ja-JP': { translation: jaJP },
  'zh-CN': { translation: zhCN },
};

i18n.use(initReactI18next).init({
  resources,
  ...i18nConfig,
});

export default i18n;
