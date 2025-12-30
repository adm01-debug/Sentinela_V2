import React from 'react';
import { useI18n, locales, type Locale } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'select' | 'dropdown' | 'buttons';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className,
}) => {
  const { locale, setLocale } = useI18n();

  const localeEntries = Object.entries(locales) as [Locale, typeof locales[Locale]][];

  if (variant === 'select') {
    return (
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className={cn('w-[180px]', className)}>
          <SelectValue>
            {showFlag && locales[locale].flag}{' '}
            {showNativeName ? locales[locale].nativeName : locales[locale].name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {localeEntries.map(([code, info]) => (
            <SelectItem key={code} value={code}>
              {showFlag && info.flag} {showNativeName ? info.nativeName : info.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={cn('flex gap-1', className)}>
        {localeEntries.map(([code, info]) => (
          <Button
            key={code}
            variant={locale === code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLocale(code)}
            className="gap-1"
          >
            {showFlag && <span>{info.flag}</span>}
            {!showFlag && <span>{code.split('-')[0].toUpperCase()}</span>}
          </Button>
        ))}
      </div>
    );
  }

  // Default: dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {localeEntries.map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code)}
            className="flex items-center justify-between"
          >
            <span>
              {showFlag && info.flag}{' '}
              {showNativeName ? info.nativeName : info.name}
            </span>
            {locale === code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Formatted Date component
interface FormattedDateProps {
  date: Date | string;
  format?: 'short' | 'medium' | 'long' | 'full';
  showTime?: boolean;
  className?: string;
}

export const FormattedDate: React.FC<FormattedDateProps> = ({
  date,
  format = 'medium',
  showTime = false,
  className,
}) => {
  const { formatDate } = useI18n();

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(showTime && { timeStyle: 'short' }),
  };

  return (
    <time dateTime={new Date(date).toISOString()} className={className}>
      {formatDate(date, options)}
    </time>
  );
};

// Formatted Number component
interface FormattedNumberProps {
  value: number;
  type?: 'decimal' | 'percent' | 'unit';
  unit?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  type = 'decimal',
  unit,
  minimumFractionDigits,
  maximumFractionDigits,
  className,
}) => {
  const { formatNumber } = useI18n();

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits,
    maximumFractionDigits,
  };

  if (type === 'percent') {
    options.style = 'percent';
  } else if (type === 'unit' && unit) {
    options.style = 'unit';
    options.unit = unit;
  }

  return <span className={className}>{formatNumber(value, options)}</span>;
};

// Formatted Currency component
interface FormattedCurrencyProps {
  value: number;
  currency?: string;
  className?: string;
}

export const FormattedCurrency: React.FC<FormattedCurrencyProps> = ({
  value,
  currency = 'BRL',
  className,
}) => {
  const { formatCurrency } = useI18n();

  return <span className={className}>{formatCurrency(value, currency)}</span>;
};

// Relative Time component
interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export const RelativeTime: React.FC<RelativeTimeProps> = ({
  date,
  className,
}) => {
  const { formatRelativeTime } = useI18n();

  return (
    <time dateTime={new Date(date).toISOString()} className={className}>
      {formatRelativeTime(date)}
    </time>
  );
};

// Trans component for inline translations
interface TransProps {
  i18nKey: string;
  params?: Record<string, string | number>;
  className?: string;
}

export const Trans: React.FC<TransProps> = ({
  i18nKey,
  params,
  className,
}) => {
  const { t } = useI18n();

  return <span className={className}>{t(i18nKey, params)}</span>;
};
