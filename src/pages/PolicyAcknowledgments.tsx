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
  Image as ImageIcon,
  UserX,
  Plus,
  Trash2,
  ShieldOff,
  PieChart,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

interface Exemption {
  id: string;
  employee_name: string;
  reason: string | null;
  exempted_by: string | null;
  created_at: string;
  expires_at: string | null;
}

interface ComplianceData {
  totalEmployees: number;
  confirmedToday: number;
  exemptCount: number;
  pendingCount: number;
  complianceRate: number;
  pendingEmployees: string[];
  confirmedEmployees: string[];
}

export default function PolicyAcknowledgments() {
  const [acknowledgments, setAcknowledgments] = useState<Acknowledgment[]>([]);
  const [exemptions, setExemptions] = useState<Exemption[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingExemptions, setLoadingExemptions] = useState(true);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('acknowledgments');
  
  // New exemption form state
  const [newExemptionOpen, setNewExemptionOpen] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [submittingExemption, setSubmittingExemption] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAcknowledgments();
    fetchExemptions();
    fetchComplianceData();
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

  const fetchExemptions = async () => {
    setLoadingExemptions(true);
    try {
      const { data, error } = await supabase
        .from('policy_exemptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExemptions(data || []);
    } catch (err) {
      console.error('Error fetching exemptions:', err);
    } finally {
      setLoadingExemptions(false);
    }
  };

  const fetchComplianceData = async () => {
    setLoadingCompliance(true);
    try {
      // Get all unique employees from various sources
      const [keystrokeRes, productivityRes, exemptionsRes, todayAckRes] = await Promise.all([
        supabase.from('keystroke_logs').select('employee_name'),
        supabase.from('productivity_logs').select('employee_name'),
        supabase.from('policy_exemptions').select('employee_name, expires_at'),
        supabase.from('policy_acknowledgments')
          .select('employee_name')
          .gte('acknowledged_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      ]);

      // Combine all unique employee names
      const allEmployees = new Set<string>();
      keystrokeRes.data?.forEach(e => allEmployees.add(e.employee_name));
      productivityRes.data?.forEach(e => allEmployees.add(e.employee_name));

      // Get valid exemptions (not expired)
      const validExemptions = new Set<string>();
      exemptionsRes.data?.forEach(e => {
        if (!e.expires_at || new Date(e.expires_at) >= new Date()) {
          validExemptions.add(e.employee_name);
        }
      });

      // Get employees who confirmed today
      const confirmedToday = new Set<string>();
      todayAckRes.data?.forEach(e => confirmedToday.add(e.employee_name));

      // Calculate compliance
      const totalEmployees = allEmployees.size;
      const exemptCount = validExemptions.size;
      const confirmedCount = confirmedToday.size;
      
      // Employees who need to confirm (not exempt)
      const needsConfirmation = [...allEmployees].filter(e => !validExemptions.has(e));
      const pendingEmployees = needsConfirmation.filter(e => !confirmedToday.has(e));
      const confirmedEmployees = needsConfirmation.filter(e => confirmedToday.has(e));
      
      const pendingCount = pendingEmployees.length;
      const requiredCount = needsConfirmation.length;
      const complianceRate = requiredCount > 0 
        ? Math.round((confirmedEmployees.length / requiredCount) * 100) 
        : 100;

      setCompliance({
        totalEmployees,
        confirmedToday: confirmedEmployees.length,
        exemptCount,
        pendingCount,
        complianceRate,
        pendingEmployees,
        confirmedEmployees
      });
    } catch (err) {
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoadingCompliance(false);
    }
  };

  const addExemption = async () => {
    if (!newEmployeeName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do funcionário é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingExemption(true);
    try {
      const { error } = await supabase
        .from('policy_exemptions')
        .insert({
          employee_name: newEmployeeName.trim(),
          reason: newReason.trim() || null,
          exempted_by: user?.id,
          expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Isenção adicionada",
        description: `${newEmployeeName} foi isento da confirmação diária.`
      });

      setNewExemptionOpen(false);
      setNewEmployeeName('');
      setNewReason('');
      setNewExpiresAt('');
      fetchExemptions();
    } catch (err: any) {
      console.error('Error adding exemption:', err);
      toast({
        title: "Erro",
        description: err.message?.includes('duplicate') 
          ? "Este funcionário já está isento." 
          : "Não foi possível adicionar a isenção.",
        variant: "destructive"
      });
    } finally {
      setSubmittingExemption(false);
    }
  };

  const removeExemption = async (id: string, employeeName: string) => {
    try {
      const { error } = await supabase
        .from('policy_exemptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Isenção removida",
        description: `${employeeName} agora precisa confirmar políticas diariamente.`
      });

      fetchExemptions();
    } catch (err) {
      console.error('Error removing exemption:', err);
      toast({
        title: "Erro",
        description: "Não foi possível remover a isenção.",
        variant: "destructive"
      });
    }
  };

  const isExemptionExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Isentos</p>
                  <p className="text-2xl font-bold">{exemptions.length}</p>
                </div>
                <ShieldOff className="h-8 w-8 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="acknowledgments" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Confirmações
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <PieChart className="h-4 w-4" />
              Conformidade
              {compliance && compliance.complianceRate < 100 && (
                <Badge variant="destructive" className="ml-1">{compliance.complianceRate}%</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="exemptions" className="gap-2">
              <UserX className="h-4 w-4" />
              Isenções
              {exemptions.length > 0 && (
                <Badge variant="secondary" className="ml-1">{exemptions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="acknowledgments" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="exemptions" className="space-y-6">
            {/* Exemptions Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Usuários Isentos</h2>
                <p className="text-sm text-muted-foreground">
                  Funcionários que não precisam confirmar políticas diariamente
                </p>
              </div>
              <Dialog open={newExemptionOpen} onOpenChange={setNewExemptionOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Isenção
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Isenção</DialogTitle>
                    <DialogDescription>
                      Adicione um funcionário que não precisa confirmar as políticas diariamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee-name">Nome ou Email do Funcionário *</Label>
                      <Input
                        id="employee-name"
                        placeholder="ex: joao.silva@empresa.com"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo da Isenção</Label>
                      <Textarea
                        id="reason"
                        placeholder="ex: Funcionário trabalha remotamente em área sem acesso à câmera"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires-at">Data de Expiração (opcional)</Label>
                      <Input
                        id="expires-at"
                        type="date"
                        value={newExpiresAt}
                        onChange={(e) => setNewExpiresAt(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para isenção permanente
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewExemptionOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addExemption} disabled={submittingExemption}>
                      {submittingExemption ? 'Adicionando...' : 'Adicionar Isenção'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Exemptions List */}
            <Card>
              <CardContent className="pt-6">
                {loadingExemptions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : exemptions.length === 0 ? (
                  <div className="text-center py-12">
                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nenhum usuário isento.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Todos os funcionários precisam confirmar as políticas diariamente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exemptions.map((exemption) => (
                      <div
                        key={exemption.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isExemptionExpired(exemption.expires_at)
                            ? 'border-destructive/30 bg-destructive/5'
                            : 'border-border bg-card/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-amber-500/10">
                            <ShieldOff className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{exemption.employee_name}</p>
                              {isExemptionExpired(exemption.expires_at) && (
                                <Badge variant="destructive" className="text-xs">Expirado</Badge>
                              )}
                              {!exemption.expires_at && (
                                <Badge variant="secondary" className="text-xs">Permanente</Badge>
                              )}
                            </div>
                            {exemption.reason && (
                              <p className="text-sm text-muted-foreground">{exemption.reason}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>
                                Criado em {format(new Date(exemption.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              {exemption.expires_at && (
                                <span>
                                  Expira em {format(new Date(exemption.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Isenção</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover a isenção de <strong>{exemption.employee_name}</strong>?
                                Este funcionário passará a precisar confirmar as políticas diariamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeExemption(exemption.id, exemption.employee_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remover Isenção
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Relatório de Conformidade</h2>
                <p className="text-sm text-muted-foreground">
                  Visão geral da conformidade diária com as políticas de monitoramento
                </p>
              </div>
              <Button variant="outline" onClick={fetchComplianceData} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Atualizar
              </Button>
            </div>

            {loadingCompliance ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : compliance ? (
              <>
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                          <p className={`text-3xl font-bold ${
                            compliance.complianceRate === 100 
                              ? 'text-green-500' 
                              : compliance.complianceRate >= 80 
                                ? 'text-amber-500' 
                                : 'text-destructive'
                          }`}>
                            {compliance.complianceRate}%
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          compliance.complianceRate === 100 
                            ? 'bg-green-500/10' 
                            : compliance.complianceRate >= 80 
                              ? 'bg-amber-500/10' 
                              : 'bg-destructive/10'
                        }`}>
                          <PieChart className={`h-6 w-6 ${
                            compliance.complianceRate === 100 
                              ? 'text-green-500' 
                              : compliance.complianceRate >= 80 
                                ? 'text-amber-500' 
                                : 'text-destructive'
                          }`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Confirmaram Hoje</p>
                          <p className="text-3xl font-bold text-green-500">{compliance.confirmedToday}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-500/10">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pendentes</p>
                          <p className={`text-3xl font-bold ${compliance.pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {compliance.pendingCount}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${compliance.pendingCount > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
                          <AlertCircle className={`h-6 w-6 ${compliance.pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total de Funcionários</p>
                          <p className="text-3xl font-bold">{compliance.totalEmployees}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ({compliance.exemptCount} isento{compliance.exemptCount !== 1 ? 's' : ''})
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-primary/10">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progresso do Dia</span>
                        <span className="text-sm text-muted-foreground">
                          {compliance.confirmedToday} de {compliance.confirmedToday + compliance.pendingCount} funcionários
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            compliance.complianceRate === 100 
                              ? 'bg-green-500' 
                              : compliance.complianceRate >= 80 
                                ? 'bg-amber-500' 
                                : 'bg-destructive'
                          }`}
                          style={{ width: `${compliance.complianceRate}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending */}
                  <Card className={compliance.pendingCount > 0 ? 'border-destructive/30' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertCircle className={`h-5 w-5 ${compliance.pendingCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        Pendentes ({compliance.pendingCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {compliance.pendingEmployees.length === 0 ? (
                        <div className="text-center py-6">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Todos os funcionários confirmaram!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {compliance.pendingEmployees.map((name, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                              <div className="p-1.5 rounded-full bg-destructive/10">
                                <User className="h-4 w-4 text-destructive" />
                              </div>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Confirmed */}
                  <Card className="border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Confirmados Hoje ({compliance.confirmedToday})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {compliance.confirmedEmployees.length === 0 ? (
                        <div className="text-center py-6">
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma confirmação ainda hoje.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {compliance.confirmedEmployees.map((name, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                              <div className="p-1.5 rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Não foi possível carregar os dados de conformidade.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}