import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  MicOff,
  Sparkles,
  Clock,
  TrendingUp,
  X,
  ArrowRight,
  Command,
  Users,
  AlertTriangle,
  BarChart2,
  FileText,
  Settings,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================
// WEB SPEECH API TYPES
// ============================================
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ============================================
// NATURAL LANGUAGE SEARCH COMPONENT
// ============================================
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'employee' | 'alert' | 'report' | 'setting' | 'action' | 'help';
  url?: string;
  action?: () => void;
  metadata?: Record<string, string>;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
}

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onVoiceSearch?: (transcript: string) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  placeholder?: string;
  className?: string;
}

const resultIcons: Record<SearchResult['type'], React.ElementType> = {
  employee: Users,
  alert: AlertTriangle,
  report: BarChart2,
  setting: Settings,
  action: Sparkles,
  help: HelpCircle,
};

const resultTypeLabels: Record<SearchResult['type'], string> = {
  employee: 'Funcionário',
  alert: 'Alerta',
  report: 'Relatório',
  setting: 'Configuração',
  action: 'Ação',
  help: 'Ajuda',
};

export function NaturalLanguageSearch({
  onSearch,
  onVoiceSearch,
  suggestions = [],
  recentSearches = [],
  placeholder = 'Buscar com IA... (ex: "funcionários com baixa produtividade esta semana")',
  className,
}: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        let transcript = '';
        for (let i = 0; i < results.length; i++) {
          transcript += results[i][0].transcript;
        }
        setQuery(transcript);
        
        if (results[0]?.isFinal) {
          handleSearch(transcript);
          onVoiceSearch?.(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onVoiceSearch]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : 
                  query.length === 0 ? [...recentSearches.map((s, i) => ({ id: `recent-${i}` })), ...suggestions] : [];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const result = results[selectedIndex];
          if (result.action) {
            result.action();
          } else if (result.url) {
            window.location.href = result.url;
          }
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  }, [results, selectedIndex, query.length, recentSearches, suggestions]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.url) {
      window.location.href = result.url;
    }
    setIsFocused(false);
  }, []);

  const showDropdown = isFocused && (results.length > 0 || query.length === 0);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {recognitionRef.current && (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-6 w-6', isListening && 'text-red-500')}
              onClick={toggleVoiceSearch}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <MicOff className="h-3 w-3" />
                </motion.div>
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
          )}
          <Badge variant="secondary" className="text-[10px] px-1.5">
            <Command className="h-2.5 w-2.5 mr-0.5" />K
          </Badge>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-xl shadow-lg overflow-hidden z-50"
          >
            {/* AI hint */}
            {query.length === 0 && (
              <div className="p-3 border-b bg-primary/5">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Use linguagem natural: "mostre alertas críticos de hoje"
                  </span>
                </div>
              </div>
            )}

            {/* Recent searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  Buscas recentes
                </p>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent',
                      selectedIndex === index && 'bg-accent'
                    )}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {query.length === 0 && suggestions.length > 0 && (
              <div className="p-2 border-t">
                <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  Sugestões
                </p>
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent',
                      selectedIndex === recentSearches.length + index && 'bg-accent'
                    )}
                    onClick={() => {
                      setQuery(suggestion.text);
                      handleSearch(suggestion.text);
                    }}
                  >
                    {suggestion.type === 'trending' ? (
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {/* Search results */}
            {results.length > 0 && (
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {results.map((result, index) => {
                  const Icon = resultIcons[result.type];
                  return (
                    <button
                      key={result.id}
                      className={cn(
                        'w-full flex items-start gap-3 p-2 rounded-md hover:bg-accent text-left',
                        selectedIndex === index && 'bg-accent'
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{result.title}</p>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {resultTypeLabels[result.type]}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <div className="flex gap-2 mt-1">
                            {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="text-xs text-muted-foreground">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !isLoading && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado para "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente usar termos diferentes ou uma descrição mais detalhada
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// COMMAND PALETTE COMPONENT
// ============================================
interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  shortcut?: string[];
  action: () => void;
  category?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
}

export function CommandPalette({
  open,
  onOpenChange,
  actions,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredActions = useMemo(() => {
    if (!query) return actions;
    const lowerQuery = query.toLowerCase();
    return actions.filter(
      action =>
        action.title.toLowerCase().includes(lowerQuery) ||
        action.description?.toLowerCase().includes(lowerQuery) ||
        action.category?.toLowerCase().includes(lowerQuery)
    );
  }, [actions, query]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    filteredActions.forEach(action => {
      const category = action.category || 'Geral';
      if (!groups[category]) groups[category] = [];
      groups[category].push(action);
    });
    return groups;
  }, [filteredActions]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onOpenChange(false);
        }
        break;
    }
  }, [filteredActions, selectedIndex, onOpenChange]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onOpenChange]);

  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Paleta de Comandos</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando ou busque..."
            className="border-0 focus-visible:ring-0 px-3"
          />
          <Badge variant="outline" className="shrink-0 text-xs">ESC</Badge>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category} className="mb-2">
              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                {category}
              </p>
              {categoryActions.map((action) => {
                const currentIndex = flatIndex++;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-accent',
                      selectedIndex === currentIndex && 'bg-accent'
                    )}
                    onClick={() => {
                      action.action();
                      onOpenChange(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm">{action.title}</span>
                    </div>
                    {action.shortcut && (
                      <div className="flex gap-1">
                        {action.shortcut.map((key, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1.5">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredActions.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum comando encontrado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NaturalLanguageSearch;
