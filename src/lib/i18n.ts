import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, { name: string; flag: string }> = {
  'pt-BR': { name: 'Português', flag: '🇧🇷' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'es': { name: 'Español', flag: '🇪🇸' },
};

const resources = {
  'pt-BR': {
    translation: {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        add: 'Adicionar',
        search: 'Buscar',
        loading: 'Carregando...',
        noData: 'Nenhum dado encontrado',
      },
      nav: {
        dashboard: 'Dashboard',
        employees: 'Funcionários',
        reports: 'Relatórios',
        settings: 'Configurações',
      },
    },
  },
  'en-US': {
    translation: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        noData: 'No data found',
      },
      nav: {
        dashboard: 'Dashboard',
        employees: 'Employees',
        reports: 'Reports',
        settings: 'Settings',
      },
    },
  },
  'es': {
    translation: {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        add: 'Agregar',
        search: 'Buscar',
        loading: 'Cargando...',
        noData: 'No se encontraron datos',
      },
      nav: {
        dashboard: 'Panel',
        employees: 'Empleados',
        reports: 'Informes',
        settings: 'Configuración',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
  localStorage.setItem('preferred-language', lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language || 'pt-BR') as SupportedLanguage;
}

export default i18n;
