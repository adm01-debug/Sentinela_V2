import { useState } from 'react';
import { useGeofences, Geofence } from '@/hooks/useGeofences';
import { useEmployees } from '@/hooks/useEmployees';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Trash2, Edit, Users, AlertTriangle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Geofencing() {
  const { geofences, violations, loading, createGeofence, updateGeofence, deleteGeofence, assignToEmployee, removeFromEmployee } = useGeofences();
  const { employees } = useEmployees();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    radius_meters: '100',
    address: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius_meters: '100',
      address: '',
      is_active: true,
    });
  };

  const handleCreate = async () => {
    await createGeofence({
      name: formData.name,
      description: formData.description || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius_meters: parseInt(formData.radius_meters),
      address: formData.address || null,
      is_active: formData.is_active,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!selectedGeofence) return;
    await updateGeofence(selectedGeofence.id, {
      name: formData.name,
      description: formData.description || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius_meters: parseInt(formData.radius_meters),
      address: formData.address || null,
      is_active: formData.is_active,
    });
    setIsEditOpen(false);
    setSelectedGeofence(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta geofence?')) {
      await deleteGeofence(id);
    }
  };

  const handleAssign = async () => {
    if (!selectedGeofence || !selectedEmployeeId) return;
    await assignToEmployee(selectedEmployeeId, selectedGeofence.id);
    setIsAssignOpen(false);
    setSelectedEmployeeId('');
  };

  const openEditDialog = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description || '',
      latitude: geofence.latitude.toString(),
      longitude: geofence.longitude.toString(),
      radius_meters: geofence.radius_meters.toString(),
      address: geofence.address || '',
      is_active: geofence.is_active,
    });
    setIsEditOpen(true);
  };

  const openAssignDialog = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setIsAssignOpen(true);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geofencing</h1>
          <p className="text-muted-foreground">
            Configure áreas geográficas permitidas para os funcionários
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Geofence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Geofence</DialogTitle>
              <DialogDescription>
                Defina uma área geográfica permitida para monitoramento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Escritório Principal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da localização"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                    placeholder="-23.5505"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-46.6333"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={getCurrentLocation} type="button">
                <Navigation className="mr-2 h-4 w-4" />
                Usar Localização Atual
              </Button>
              <div className="grid gap-2">
                <Label htmlFor="radius">Raio (metros)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={formData.radius_meters}
                  onChange={(e) => setFormData((prev) => ({ ...prev, radius_meters: e.target.value }))}
                  placeholder="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua Exemplo, 123"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Ativa</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || !formData.latitude || !formData.longitude}>
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="geofences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geofences">
            <MapPin className="mr-2 h-4 w-4" />
            Geofences
          </TabsTrigger>
          <TabsTrigger value="violations">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Violações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geofences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {geofences.map((geofence) => (
              <Card key={geofence.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{geofence.name}</CardTitle>
                    </div>
                    <Badge variant={geofence.is_active ? 'default' : 'secondary'}>
                      {geofence.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  {geofence.description && (
                    <CardDescription>{geofence.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordenadas:</span>
                      <span className="font-mono">
                        {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Raio:</span>
                      <span>{geofence.radius_meters}m</span>
                    </div>
                    {geofence.address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço:</span>
                        <span className="text-right max-w-[200px] truncate">{geofence.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(geofence)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openAssignDialog(geofence)}>
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(geofence.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {geofences.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma geofence configurada</p>
                <p className="text-sm text-muted-foreground">
                  Crie uma nova geofence para começar a monitorar localizações
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Violações de Geofence</CardTitle>
              <CardDescription>
                Registros de funcionários detectados fora das áreas permitidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Localização Detectada</TableHead>
                    <TableHead>Distância</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        {format(new Date(violation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{violation.employee_name}</TableCell>
                      <TableCell>{violation.device || '-'}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {violation.latitude.toFixed(4)}, {violation.longitude.toFixed(4)}
                        </span>
                        {violation.detected_address && (
                          <span className="block text-xs text-muted-foreground">
                            {violation.detected_address}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {violation.distance_meters ? `${violation.distance_meters}m` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{violation.action_taken}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {violations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma violação registrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Geofence</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-radius">Raio (metros)</Label>
              <Input
                id="edit-radius"
                type="number"
                value={formData.radius_meters}
                onChange={(e) => setFormData((prev) => ({ ...prev, radius_meters: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-is_active">Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Geofence</DialogTitle>
            <DialogDescription>
              Selecione um funcionário para atribuir a geofence "{selectedGeofence?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={!selectedEmployeeId}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
