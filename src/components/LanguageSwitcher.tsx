import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage } from '@/lib/i18n';

// ============================================================
// LANGUAGE SWITCHER COMPONENT
// ============================================================

export const LanguageSwitcher = memo(function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;
  const currentInfo = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES['pt-BR'];

  const handleChangeLanguage = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          aria-label="Selecionar idioma"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentInfo.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleChangeLanguage(code as SupportedLanguage)}
            className={currentLanguage === code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{info.flag}</span>
            {info.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default LanguageSwitcher;
