import { MapPin, Plus, Edit, Trash2, Users, Search, Bell, LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeofencingPage } from '@/hooks/useGeofencingPage';
import { GeofenceDashboard } from '@/components/geofence/GeofenceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function GeofencingPage() {
  const { toast } = useToast();
  const {
    selectedGeofence, setSelectedGeofence,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingGeofence, formData, setFormData,
    geofences, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog, handleSubmit, handleDelete,
  } = useGeofencingPage();

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geofencing"
        description="Configure cercas geográficas e áreas monitoradas"
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/geofencing/alerts'} className="h-9 gap-2">
              <Bell className="h-4 w-4" />
              Ver Alertas
            </Button>
            <Button onClick={handleOpenCreate} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Nova Geofence
            </Button>
          </div>
        }
      />


      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <MapPin className="h-4 w-4" />
            Geofences
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-success">{stats.active}</p><p className="text-xs text-muted-foreground">Ativas</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{stats.restricted}</p><p className="text-xs text-muted-foreground">Restritas</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-info">{stats.required}</p><p className="text-xs text-muted-foreground">Obrigatórias</p></CardContent></Card>
          </div>

          {/* Geofences Grid */}
          {geofences.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma geofence configurada.</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geofences.map(geo => (
                <Card key={geo.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedGeofence?.id === geo.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedGeofence(geo)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: geo.color }} />
                        {geo.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); handleOpenEdit(geo); }}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setSelectedGeofence(geo); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{geo.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={geo.is_active ? 'default' : 'secondary'}>{geo.is_active ? 'Ativa' : 'Inativa'}</Badge>
                      <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{geo.employees_count || 0}</Badge>
                      <Badge variant="outline">{geo.radius}m</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">📍 {geo.center_lat?.toFixed(4)}, {geo.center_lng?.toFixed(4)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboard">
          <GeofenceDashboard />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingGeofence ? 'Editar Geofence' : 'Nova Geofence'}</DialogTitle>
            <DialogDescription>
              Configure os detalhes da área monitorada. Para polígonos, você pode desenhar ou importar coordenadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Escritório Central" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Área</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circular (Raio)</SelectItem>
                    <SelectItem value="polygon">Polígono (Livre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição opcional" />
            </div>

            {formData.type === 'circle' ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="0.0001" value={formData.center_lat} onChange={e => setFormData(prev => ({ ...prev, center_lat: parseFloat(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="0.0001" value={formData.center_lng} onChange={e => setFormData(prev => ({ ...prev, center_lng: parseFloat(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Raio (m)</Label>
                  <Input type="number" value={formData.radius} onChange={e => setFormData(prev => ({ ...prev, radius: parseInt(e.target.value) }))} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Coordenadas do Polígono</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                    const input = prompt('Cole aqui o JSON das coordenadas (Ex: [[lat,lng],[lat,lng],...])');
                    if (input) {
                      try {
                        const coords = JSON.parse(input);
                        if (Array.isArray(coords)) {
                          setFormData(prev => ({ ...prev, coordinates: coords }));
                          toast({ title: 'Coordenadas importadas!' });
                        }
                      } catch (e) {
                        toast({ title: 'Erro no formato', variant: 'destructive' });
                      }
                    }
                  }}>Importar JSON</Button>
                </div>
                <div className="bg-muted p-3 rounded-md max-h-32 overflow-auto text-xs font-mono">
                  {formData.coordinates && formData.coordinates.length > 0 
                    ? JSON.stringify(formData.coordinates)
                    : 'Nenhuma coordenada definida. Use o mapa ou importe um arquivo.'}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
              <div className="space-y-0.5">
                <Label>Status da Geofence</Label>
                <p className="text-xs text-muted-foreground">Áreas inativas não geram alertas</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating || !formData.name}>
              {isCreating || isUpdating ? 'Salvando...' : editingGeofence ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Geofence?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A geofence "{selectedGeofence?.name}" será removida permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GeofencingPage };
