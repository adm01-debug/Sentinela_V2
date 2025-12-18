import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ClipboardCheck, 
  MapPin, 
  Calendar, 
  User, 
  Monitor,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface Acknowledgment {
  id: string;
  employee_name: string;
  acknowledged_at: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  device_name: string | null;
  policy_version: string | null;
}

export default function PolicyAcknowledgments() {
  const [acknowledgments, setAcknowledgments] = useState<Acknowledgment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAcknowledgments();
  }, [page, dateFilter]);

  const fetchAcknowledgments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('policy_acknowledgments')
        .select('*', { count: 'exact' })
        .order('acknowledged_at', { ascending: false });

      // Date filter
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('acknowledged_at', today.toISOString());
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('acknowledged_at', weekAgo.toISOString());
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('acknowledged_at', monthAgo.toISOString());
      }

      // Pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setAcknowledgments(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching acknowledgments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAcknowledgments = acknowledgments.filter(ack =>
    ack.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Confirmações de Políticas</h1>
              <p className="text-muted-foreground">Histórico de aceitação das políticas de monitoramento</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Confirmações</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmações Hoje</p>
                  <p className="text-2xl font-bold">
                    {acknowledgments.filter(a => isToday(a.acknowledged_at)).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Com Foto</p>
                  <p className="text-2xl font-bold">
                    {acknowledgments.filter(a => a.photo_url).length}
                  </p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Com Localização</p>
                  <p className="text-2xl font-bold">
                    {acknowledgments.filter(a => a.latitude && a.longitude).length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por funcionário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgments List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Confirmações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredAcknowledgments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma confirmação encontrada.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAcknowledgments.map((ack) => (
                  <div
                    key={ack.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors"
                  >
                    {/* Photo */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="shrink-0 cursor-pointer">
                          {ack.photo_url ? (
                            <img
                              src={ack.photo_url}
                              alt={`Foto de ${ack.employee_name}`}
                              className="w-16 h-16 rounded-lg object-cover border border-border hover:border-primary transition-colors"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                      {ack.photo_url && (
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Foto de Confirmação - {ack.employee_name}</DialogTitle>
                          </DialogHeader>
                          <img
                            src={ack.photo_url}
                            alt={`Foto de ${ack.employee_name}`}
                            className="w-full rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground text-center">
                            {format(new Date(ack.acknowledged_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </DialogContent>
                      )}
                    </Dialog>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{ack.employee_name}</h3>
                        {isToday(ack.acknowledged_at) && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 shrink-0">
                            Hoje
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(ack.acknowledged_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>

                        {ack.device_name && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Monitor className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{ack.device_name.substring(0, 50)}...</span>
                          </div>
                        )}

                        {ack.location_address && (
                          <div className="flex items-center gap-1.5 md:col-span-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{ack.location_address}</span>
                            {ack.latitude && ack.longitude && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => openInMaps(ack.latitude!, ack.longitude!)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Version Badge */}
                    {ack.policy_version && (
                      <Badge variant="secondary" className="shrink-0">
                        v{ack.policy_version}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * itemsPerPage) + 1} a {Math.min(page * itemsPerPage, totalCount)} de {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}