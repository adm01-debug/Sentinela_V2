import { useMemo, useState } from 'react';
import { useGeoBlocking, COUNTRIES } from '@/hooks/useGeoBlocking';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Globe,
  Plus,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  MapPin,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Emoji de bandeira a partir do ISO-3166-1 alpha-2
const getCountryFlag = (code: string) => {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🏳️';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function GeoBlockingManager() {
  const {
    settings,
    whitelistedCountries,
    availableCountries,
    isLoading,
    updateSettings,
    addCountry,
    removeCountry,
    toggleCountry,
    isUpdating,
    isAdding,
    isRemoving,
  } = useGeoBlocking();

  // Estados separados — antes um único `searchTerm` filtrava simultaneamente
  // o combobox de adicionar e a lista da whitelist, causando confusão.
  const [whitelistSearch, setWhitelistSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [comboOpen, setComboOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const q = whitelistSearch.trim().toLowerCase();
  const filteredWhitelist = useMemo(() => {
    if (!q) return whitelistedCountries;
    return whitelistedCountries.filter(
      (c) =>
        c.country_name.toLowerCase().includes(q) ||
        c.country_code.toLowerCase().includes(q),
    );
  }, [whitelistedCountries, q]);

  const selectedCountryLabel = useMemo(() => {
    if (!selectedCountry) return '';
    const c = COUNTRIES.find((x) => x.code === selectedCountry);
    return c ? `${getCountryFlag(c.code)} ${c.name} (${c.code})` : selectedCountry;
  }, [selectedCountry]);

  const handleAddCountry = () => {
    if (!selectedCountry) return;
    const country = COUNTRIES.find((c) => c.code === selectedCountry);
    if (!country) return;
    addCountry(
      { countryCode: country.code, countryName: country.name },
      { onSuccess: () => setSelectedCountry('') },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    removeCountry(deleteTarget, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Bloqueio Geográfico</CardTitle>
              <CardDescription>
                Controle de acesso baseado em localização geográfica (Whitelist Global)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <Label htmlFor="geo-enabled" className="font-medium cursor-pointer">
                  Bloqueio Geográfico Ativo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Apenas países na whitelist terão acesso
                </p>
              </div>
            </div>
            <Switch
              id="geo-enabled"
              checked={settings?.enabled ?? false}
              onCheckedChange={(checked) => updateSettings({ enabled: checked, mode: 'whitelist' })}
              disabled={isUpdating}
              aria-label="Ativar bloqueio geográfico"
            />
          </div>

          {/* Mode Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <div className="text-sm">
              <span className="font-medium text-foreground">Modo Whitelist Ativo:</span>
              <span className="text-muted-foreground ml-1">
                Somente países listados abaixo podem acessar o sistema
              </span>
            </div>
          </div>

          {/* Additional Security Options */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'block-vpn', label: 'Bloquear VPN', key: 'block_vpn' as const },
              { id: 'block-proxy', label: 'Bloquear Proxy', key: 'block_proxy' as const },
              { id: 'block-tor', label: 'Bloquear Tor', key: 'block_tor' as const },
            ].map((opt) => (
              <div key={opt.id} className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                  {opt.label}
                </Label>
                <Switch
                  id={opt.id}
                  checked={(settings?.[opt.key] as boolean | undefined) ?? false}
                  onCheckedChange={(checked) => updateSettings({ [opt.key]: checked })}
                  disabled={isUpdating}
                  aria-label={opt.label}
                />
              </div>
            ))}
          </div>

          {/* Log Option */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label htmlFor="log-blocked" className="flex items-center gap-2 cursor-pointer">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>
                <span className="block">Registrar tentativas bloqueadas</span>
                <span className="block text-xs text-muted-foreground">
                  Salvar logs de acessos negados
                </span>
              </span>
            </Label>
            <Switch
              id="log-blocked"
              checked={settings?.log_blocked_attempts ?? true}
              onCheckedChange={(checked) => updateSettings({ log_blocked_attempts: checked })}
              disabled={isUpdating}
              aria-label="Registrar tentativas bloqueadas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Whitelist Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" aria-hidden="true" />
              Países Permitidos (Whitelist)
            </CardTitle>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              {whitelistedCountries.length}{' '}
              {whitelistedCountries.length === 1 ? 'país' : 'países'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Country - Combobox estável (substitui Input dentro de Select, que quebrava foco) */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  aria-label="Selecionar país para adicionar à whitelist"
                  className="flex-1 justify-between font-normal"
                  disabled={availableCountries.length === 0}
                >
                  <span className="truncate">
                    {selectedCountryLabel ||
                      (availableCountries.length === 0
                        ? 'Todos os países já estão na whitelist'
                        : 'Selecione um país para adicionar...')}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar país..." />
                  <CommandList>
                    <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableCountries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={`${country.name} ${country.code}`}
                          onSelect={() => {
                            setSelectedCountry(country.code);
                            setComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedCountry === country.code ? 'opacity-100' : 'opacity-0',
                            )}
                            aria-hidden="true"
                          />
                          <span className="mr-2 text-lg" aria-hidden="true">
                            {getCountryFlag(country.code)}
                          </span>
                          {country.name}
                          <span className="ml-1 text-muted-foreground">({country.code})</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleAddCountry}
              disabled={!selectedCountry || isAdding}
              aria-label="Adicionar país selecionado"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="ml-2">Adicionar</span>
            </Button>
          </div>

          <Separator />

          {/* Search na whitelist (estado independente) */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Buscar na whitelist..."
              value={whitelistSearch}
              onChange={(e) => setWhitelistSearch(e.target.value)}
              className="pl-9"
              aria-label="Buscar países na whitelist"
            />
          </div>

          {/* Whitelist */}
          <ScrollArea className="h-[400px]">
            {filteredWhitelist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
                <p className="font-medium">
                  {q ? 'Nenhum país corresponde à busca' : 'Nenhum país na whitelist'}
                </p>
                <p className="text-sm">
                  {q ? 'Ajuste os termos de busca' : 'Adicione países para permitir o acesso'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWhitelist.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {getCountryFlag(block.country_code)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{block.country_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {block.country_code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Adicionado{' '}
                          {formatDistanceToNow(new Date(block.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={block.is_active ? 'default' : 'secondary'}>
                        {block.is_active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                            Inativo
                          </>
                        )}
                      </Badge>
                      <Switch
                        checked={block.is_active}
                        onCheckedChange={(checked) =>
                          toggleCountry({ id: block.id, isActive: checked })
                        }
                        aria-label={`${block.is_active ? 'Desativar' : 'Ativar'} ${block.country_name}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(block.id)}
                        aria-label={`Remover ${block.country_name} da whitelist`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card
        className={
          settings?.enabled
            ? 'border-success/50 bg-success/5'
            : 'border-warning/50 bg-warning/5'
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {settings?.enabled ? (
              <>
                <ShieldCheck className="h-6 w-6 text-success" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Proteção Geográfica Ativa</p>
                  <p className="text-sm text-muted-foreground">
                    Apenas acessos de {whitelistedCountries.length}{' '}
                    {whitelistedCountries.length === 1 ? 'país' : 'países'} são permitidos
                    {settings?.block_vpn && ' • VPN bloqueada'}
                    {settings?.block_proxy && ' • Proxy bloqueado'}
                    {settings?.block_tor && ' • Tor bloqueado'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-warning" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Proteção Geográfica Desativada</p>
                  <p className="text-sm text-muted-foreground">
                    Acessos de qualquer país são permitidos
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isRemoving && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover país da whitelist?</AlertDialogTitle>
            <AlertDialogDescription>
              Acessos deste país serão bloqueados se a proteção geográfica estiver ativa.
              Esta ação pode ser desfeita adicionando o país novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
