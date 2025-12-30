import React from 'react';

// Supported locales
export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

// Locale metadata
export const locales: Record<Locale, {
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}> = {
  'pt-BR': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', direction: 'ltr' },
  'en-US': { name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸', direction: 'ltr' },
  'es-ES': { name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸', direction: 'ltr' },
};

// Default locale
export const defaultLocale: Locale = 'pt-BR';

// Translations type
type TranslationValue = string | ((...args: unknown[]) => string);
type TranslationObject = { [key: string]: TranslationValue | TranslationObject };

// Translation context
interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date | string) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

// Core translations
const translations: Record<Locale, TranslationObject> = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Atualizar',
      close: 'Fechar',
      confirm: 'Confirmar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      yes: 'Sim',
      no: 'Não',
      all: 'Todos',
      none: 'Nenhum',
      select: 'Selecionar',
      actions: 'Ações',
      status: 'Status',
      date: 'Data',
      time: 'Hora',
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      description: 'Descrição',
    },
    auth: {
      login: 'Entrar',
      logout: 'Sair',
      register: 'Cadastrar',
      forgotPassword: 'Esqueci minha senha',
      resetPassword: 'Redefinir senha',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      rememberMe: 'Lembrar de mim',
    },
    nav: {
      dashboard: 'Painel',
      employees: 'Funcionários',
      monitoring: 'Monitoramento',
      reports: 'Relatórios',
      settings: 'Configurações',
      help: 'Ajuda',
    },
    validation: {
      required: 'Campo obrigatório',
      invalidEmail: 'E-mail inválido',
      minLength: (min: number) => `Mínimo de ${min} caracteres`,
      maxLength: (max: number) => `Máximo de ${max} caracteres`,
    },
    time: {
      now: 'agora',
      minutesAgo: (n: number) => `há ${n} minuto${n > 1 ? 's' : ''}`,
      hoursAgo: (n: number) => `há ${n} hora${n > 1 ? 's' : ''}`,
      daysAgo: (n: number) => `há ${n} dia${n > 1 ? 's' : ''}`,
      weeksAgo: (n: number) => `há ${n} semana${n > 1 ? 's' : ''}`,
      monthsAgo: (n: number) => `há ${n} ${n > 1 ? 'meses' : 'mês'}`,
      yearsAgo: (n: number) => `há ${n} ano${n > 1 ? 's' : ''}`,
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      select: 'Select',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      time: 'Time',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      description: 'Description',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      forgotPassword: 'Forgot password',
      resetPassword: 'Reset password',
      password: 'Password',
      confirmPassword: 'Confirm password',
      rememberMe: 'Remember me',
    },
    nav: {
      dashboard: 'Dashboard',
      employees: 'Employees',
      monitoring: 'Monitoring',
      reports: 'Reports',
      settings: 'Settings',
      help: 'Help',
    },
    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email',
      minLength: (min: number) => `Minimum ${min} characters`,
      maxLength: (max: number) => `Maximum ${max} characters`,
    },
    time: {
      now: 'now',
      minutesAgo: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
      hoursAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
      daysAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
      weeksAgo: (n: number) => `${n} week${n > 1 ? 's' : ''} ago`,
      monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
      yearsAgo: (n: number) => `${n} year${n > 1 ? 's' : ''} ago`,
    },
  },
  'es-ES': {
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Actualizar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      yes: 'Sí',
      no: 'No',
      all: 'Todos',
      none: 'Ninguno',
      select: 'Seleccionar',
      actions: 'Acciones',
      status: 'Estado',
      date: 'Fecha',
      time: 'Hora',
      name: 'Nombre',
      email: 'Correo',
      phone: 'Teléfono',
      description: 'Descripción',
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      register: 'Registrarse',
      forgotPassword: 'Olvidé mi contraseña',
      resetPassword: 'Restablecer contraseña',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      rememberMe: 'Recordarme',
    },
    nav: {
      dashboard: 'Panel',
      employees: 'Empleados',
      monitoring: 'Monitoreo',
      reports: 'Informes',
      settings: 'Configuración',
      help: 'Ayuda',
    },
    validation: {
      required: 'Campo obligatorio',
      invalidEmail: 'Correo inválido',
      minLength: (min: number) => `Mínimo ${min} caracteres`,
      maxLength: (max: number) => `Máximo ${max} caracteres`,
    },
    time: {
      now: 'ahora',
      minutesAgo: (n: number) => `hace ${n} minuto${n > 1 ? 's' : ''}`,
      hoursAgo: (n: number) => `hace ${n} hora${n > 1 ? 's' : ''}`,
      daysAgo: (n: number) => `hace ${n} día${n > 1 ? 's' : ''}`,
      weeksAgo: (n: number) => `hace ${n} semana${n > 1 ? 's' : ''}`,
      monthsAgo: (n: number) => `hace ${n} ${n > 1 ? 'meses' : 'mes'}`,
      yearsAgo: (n: number) => `hace ${n} año${n > 1 ? 's' : ''}`,
    },
  },
};

// Get nested translation value
const getNestedValue = (obj: TranslationObject, path: string): TranslationValue | undefined => {
  const keys = path.split('.');
  let current: TranslationObject | TranslationValue = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' || typeof current === 'function' ? current : undefined;
};

// I18n Provider
interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale = defaultLocale,
}) => {
  const [locale, setLocale] = React.useState<Locale>(() => {
    const stored = localStorage.getItem('locale');
    return (stored as Locale) || initialLocale;
  });

  React.useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locales[locale].direction;
  }, [locale]);

  const t = React.useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[locale], key);
    
    if (value === undefined) {
      console.warn(`Translation missing: ${key} for locale ${locale}`);
      return key;
    }
    
    if (typeof value === 'function') {
      // Handle function translations (for pluralization, etc.)
      const firstParam = params ? Object.values(params)[0] : 0;
      return value(firstParam);
    }
    
    if (params) {
      // Replace {{param}} with actual values
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => 
        String(params[paramKey] ?? `{{${paramKey}}}`)
      );
    }
    
    return value;
  }, [locale]);

  const formatDate = React.useCallback((
    date: Date | string, 
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...options,
    }).format(d);
  }, [locale]);

  const formatNumber = React.useCallback((
    num: number, 
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(locale, options).format(num);
  }, [locale]);

  const formatCurrency = React.useCallback((
    amount: number, 
    currency: string = 'BRL'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [locale]);

  const formatRelativeTime = React.useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return t('time.now');
    if (diffMins < 60) return t('time.minutesAgo', { n: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { n: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { n: diffDays });
    if (diffWeeks < 4) return t('time.weeksAgo', { n: diffWeeks });
    if (diffMonths < 12) return t('time.monthsAgo', { n: diffMonths });
    return t('time.yearsAgo', { n: diffYears });
  }, [t]);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use i18n
export const useI18n = (): I18nContextValue => {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Hook for just translation function
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};
