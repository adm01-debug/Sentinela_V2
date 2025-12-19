import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Monitor,
  Smartphone,
  Calendar,
  UserCheck,
  UserX,
  Link2,
  Unlink
} from 'lucide-react';
import { useEmployees, type EmployeeWithDetails } from '@/hooks/useEmployees';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';
import { EmployeesSkeleton } from '@/components/PageSkeletons';

const statusConfig = {
  active: { label: 'Ativo', color: 'bg-success/20 text-success' },
  inactive: { label: 'Inativo', color: 'bg-muted text-muted-foreground' },
  vacation: { label: 'Férias', color: 'bg-warning/20 text-warning' },
  leave: { label: 'Afastado', color: 'bg-info/20 text-info' }
};

const deviceTypeIcons = {
  desktop: Monitor,
  laptop: Monitor,
  mobile: Smartphone
};

export default function Employees() {
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee, assignDevice, removeDevice, assignToTeam } = useEmployees();
  const { teams } = useTeams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeviceOpen, setIsDeviceOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    team_id: '',
    status: 'active',
    hire_date: '',
    phone: '',
    notes: ''
  });
  
  const [deviceData, setDeviceData] = useState({
    device_name: '',
    device_type: 'desktop',
    is_primary: false
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchesTeam = teamFilter === 'all' || emp.team_id === teamFilter || (teamFilter === 'none' && !emp.team_id);
      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [employees, searchTerm, statusFilter, teamFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    withTeam: employees.filter(e => e.team_id).length,
    withDevices: employees.filter(e => e.devices.length > 0).length
  }), [employees]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      team_id: '',
      status: 'active',
      hire_date: '',
      phone: '',
      notes: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    await createEmployee({
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      team_id: formData.team_id || null,
      status: formData.status,
      hire_date: formData.hire_date || null,
      phone: formData.phone.trim() || null,
      avatar_url: null,
      notes: formData.notes.trim() || null
    });
    
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!selectedEmployee || !formData.name.trim()) return;
    
    await updateEmployee(selectedEmployee.id, {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      department: formData.department.trim() || null,
      position: formData.position.trim() || null,
      team_id: formData.team_id || null,
      status: formData.status,
      hire_date: formData.hire_date || null,
      phone: formData.phone.trim() || null,
      notes: formData.notes.trim() || null
    });
    
    resetForm();
    setSelectedEmployee(null);
    setIsEditOpen(false);
  };

  const handleAssignDevice = async () => {
    if (!selectedEmployee || !deviceData.device_name.trim()) return;
    
    await assignDevice(
      selectedEmployee.id, 
      deviceData.device_name.trim(), 
      deviceData.device_type, 
      deviceData.is_primary
    );
    
    setDeviceData({ device_name: '', device_type: 'desktop', is_primary: false });
    setIsDeviceOpen(false);
  };

  const openEditDialog = (employee: EmployeeWithDetails) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      department: employee.department || '',
      position: employee.position || '',
      team_id: employee.team_id || '',
      status: employee.status,
      hire_date: employee.hire_date || '',
      phone: employee.phone || '',
      notes: employee.notes || ''
    });
    setIsEditOpen(true);
  };

  const openDeviceDialog = (employee: EmployeeWithDetails) => {
    setSelectedEmployee(employee);
    setDeviceData({ device_name: '', device_type: 'desktop', is_primary: false });
    setIsDeviceOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <Header />
          <main className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="pl-64">
        <Header />
        
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Colaboradores</h1>
              <p className="text-muted-foreground">
                Gerencie colaboradores, equipes e dispositivos
              </p>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Colaborador</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo colaborador
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="João da Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="joao@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Tecnologia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Analista de Sistemas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">Equipe</Label>
                    <Select
                      value={formData.team_id}
                      onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="vacation">Férias</SelectItem>
                        <SelectItem value="leave">Afastado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Data de Admissão</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { resetForm(); setIsCreateOpen(false); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                    Criar Colaborador
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <UserCheck className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-sm text-muted-foreground">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                    <Building2 className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.withTeam}</p>
                    <p className="text-sm text-muted-foreground">Em Equipes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                    <Monitor className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.withDevices}</p>
                    <p className="text-sm text-muted-foreground">Com Dispositivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="leave">Afastado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Equipes</SelectItem>
                <SelectItem value="none">Sem Equipe</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employees Grid */}
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhum colaborador encontrado
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEmployees.map(employee => (
                <Card key={employee.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{employee.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {employee.position || 'Sem cargo'}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={cn("text-xs", statusConfig[employee.status as keyof typeof statusConfig]?.color || 'bg-muted')}>
                        {statusConfig[employee.status as keyof typeof statusConfig]?.label || employee.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {employee.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    {employee.department && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{employee.department}</span>
                      </div>
                    )}
                    {employee.team && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <Badge variant="outline">{employee.team.name}</Badge>
                      </div>
                    )}
                    {employee.hire_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Desde {new Date(employee.hire_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}

                    {/* Devices */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {employee.devices.length} dispositivo(s)
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => openDeviceDialog(employee)}>
                          <Link2 className="h-4 w-4 mr-1" />
                          Vincular
                        </Button>
                      </div>
                      {employee.devices.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {employee.devices.map(device => {
                            const Icon = deviceTypeIcons[device.device_type as keyof typeof deviceTypeIcons] || Monitor;
                            return (
                              <div
                                key={device.id}
                                className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs"
                              >
                                <Icon className="h-3 w-3" />
                                <span>{device.device_name}</span>
                                {device.is_primary && (
                                  <Badge variant="secondary" className="text-[10px] px-1">
                                    Principal
                                  </Badge>
                                )}
                                <button
                                  onClick={() => removeDevice(device.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Unlink className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Todos os dispositivos serão desvinculados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteEmployee(employee.id)} 
                              className="bg-destructive text-destructive-foreground"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
            <DialogDescription>
              Atualize os dados do colaborador
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Departamento</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Cargo</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team">Equipe</Label>
              <Select
                value={formData.team_id}
                onValueChange={(value) => setFormData({ ...formData, team_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="leave">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hire_date">Data de Admissão</Label>
              <Input
                id="edit-hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.name.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Device Dialog */}
      <Dialog open={isDeviceOpen} onOpenChange={setIsDeviceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Dispositivo</DialogTitle>
            <DialogDescription>
              Vincule um dispositivo a {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Nome do Dispositivo *</Label>
              <Input
                id="device-name"
                value={deviceData.device_name}
                onChange={(e) => setDeviceData({ ...deviceData, device_name: e.target.value })}
                placeholder="PC-JOAO-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device-type">Tipo de Dispositivo</Label>
              <Select
                value={deviceData.device_type}
                onValueChange={(value) => setDeviceData({ ...deviceData, device_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-primary"
                checked={deviceData.is_primary}
                onChange={(e) => setDeviceData({ ...deviceData, is_primary: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="is-primary">Dispositivo principal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeviceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignDevice} disabled={!deviceData.device_name.trim()}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
