import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useGeoBlocking, COUNTRIES } from '@/hooks/useGeoBlocking';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// Bandeiras usando emoji
const getCountryFlag = (code: string) => {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char: string) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function GeoBlockingManager() {
  const {
    settings,
    geoBlocks,
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredWhitelist = whitelistedCountries.filter(
    c => c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.country_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = availableCountries.filter(
    c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCountry = () => {
    if (!selectedCountry) return;
    const country = COUNTRIES.find(c => c.code === selectedCountry);
    if (country) {
      addCountry({ countryCode: country.code, countryName: country.name });
      setSelectedCountry('');
    }
  };

  const handleRemove = (id: string) => {
    removeCountry(id);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <Globe className="h-6 w-6 text-primary" />
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
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Bloqueio Geográfico Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Apenas países na whitelist terão acesso
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.enabled ?? false}
              onCheckedChange={(checked) => updateSettings({ enabled: checked, mode: 'whitelist' })}
              disabled={isUpdating}
            />
          </div>

          {/* Mode Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <span className="font-medium text-blue-700 dark:text-blue-300">Modo Whitelist Ativo:</span>
              <span className="text-blue-600 dark:text-blue-400 ml-1">
                Somente países listados abaixo podem acessar o sistema
              </span>
            </div>
          </div>

          {/* Additional Security Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="block-vpn" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Bloquear VPN
              </Label>
              <Switch
                id="block-vpn"
                checked={settings?.block_vpn ?? false}
                onCheckedChange={(checked) => updateSettings({ block_vpn: checked })}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="block-proxy" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Bloquear Proxy
              </Label>
              <Switch
                id="block-proxy"
                checked={settings?.block_proxy ?? false}
                onCheckedChange={(checked) => updateSettings({ block_proxy: checked })}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="block-tor" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Bloquear Tor
              </Label>
              <Switch
                id="block-tor"
                checked={settings?.block_tor ?? false}
                onCheckedChange={(checked) => updateSettings({ block_tor: checked })}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Log Option */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <Label htmlFor="log-blocked" className="flex items-center gap-2 cursor-pointer">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>Registrar tentativas bloqueadas</span>
                <p className="text-xs text-muted-foreground">Salvar logs de acessos negados</p>
              </div>
            </Label>
            <Switch
              id="log-blocked"
              checked={settings?.log_blocked_attempts ?? true}
              onCheckedChange={(checked) => updateSettings({ log_blocked_attempts: checked })}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Whitelist Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Países Permitidos (Whitelist)
            </CardTitle>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {whitelistedCountries.length} países
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Country */}
          <div className="flex gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um país para adicionar..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Buscar país..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <ScrollArea className="h-[200px]">
                  {filteredAvailable.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(country.code)}</span>
                        {country.name}
                        <span className="text-muted-foreground">({country.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddCountry}
              disabled={!selectedCountry || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Adicionar</span>
            </Button>
          </div>

          <Separator />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na whitelist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Whitelist */}
          <ScrollArea className="h-[400px]">
            {filteredWhitelist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">Nenhum país na whitelist</p>
                <p className="text-sm">Adicione países para permitir o acesso</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredWhitelist.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCountryFlag(block.country_code)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{block.country_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {block.country_code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Adicionado {formatDistanceToNow(new Date(block.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={block.is_active ? 'default' : 'secondary'}>
                        {block.is_active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                      <Switch
                        checked={block.is_active}
                        onCheckedChange={(checked) => toggleCountry({ id: block.id, isActive: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
      <Card className={settings?.enabled ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20'}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {settings?.enabled ? (
              <>
                <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Proteção Geográfica Ativa
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Apenas acessos de {whitelistedCountries.length} {whitelistedCountries.length === 1 ? 'país' : 'países'} são permitidos
                    {settings?.block_vpn && ' • VPN bloqueada'}
                    {settings?.block_proxy && ' • Proxy bloqueado'}
                    {settings?.block_tor && ' • Tor bloqueado'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-300">
                    Proteção Geográfica Desativada
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Acessos de qualquer país são permitidos
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover país da whitelist?</AlertDialogTitle>
            <AlertDialogDescription>
              Acessos deste país serão bloqueados se a proteção geográfica estiver ativa.
              Esta ação pode ser desfeita adicionando o país novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleRemove(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
