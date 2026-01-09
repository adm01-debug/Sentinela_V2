import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Dropdown, DropdownItem } from '../Dropdown/Dropdown';

export interface LanguageSelectorProps {
  className?: string;
  showFlag?: boolean;
  showName?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
  showFlag = true,
  showName = true,
}) => {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  
  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  return (
    <Dropdown
      className={className}
      trigger={
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {showFlag && <span className="text-lg">{currentLang.flag}</span>}
          {showName && <span className="text-sm font-medium">{currentLang.name}</span>}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
    >
      {supportedLanguages.map((lang) => (
        <DropdownItem
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={language === lang.code ? 'bg-primary-50 text-primary-600' : ''}
        >
          <span className="mr-2">{lang.flag}</span>
          {lang.name}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default LanguageSelector;
