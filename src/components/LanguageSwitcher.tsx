import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { changeLanguage, languageNames, isRTL } from '@/i18n';
import { cn } from '@/lib/utils';

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇧🇷',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  he: '🇮🇱',
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng);
  };

  const currentFlag = languageFlags[i18n.language] || '🌐';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 bg-card/80 backdrop-blur-lg border border-border/50 hover:bg-card/90"
        >
          <span className="text-base">{currentFlag}</span>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">
            {languageNames[i18n.language] || 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-popover/95 backdrop-blur-lg border border-border shadow-lg min-w-[180px]"
      >
        {Object.entries(languageNames).map(([code, name]) => {
          const isActive = i18n.language === code;
          const isRtlLang = isRTL(code);
          
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <span className="text-base">{languageFlags[code] || '🌐'}</span>
              <span className="flex-1">{name}</span>
              {isRtlLang && (
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                  RTL
                </span>
              )}
              {isActive && <Check className="h-4 w-4 ms-auto" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;