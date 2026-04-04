import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderKanban, Plus, Clock, Users, ListTodo, Search, MoreHorizontal, CheckCircle2, Circle, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-700',
};

const taskStatusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  todo: { label: 'A Fazer', icon: Circle },
  in_progress: { label: 'Em Andamento', icon: Timer },
  done: { label: 'Concluído', icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function ProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', client_name: '', budget_hours: '', color: '#3B82F6' });
  const [newTask, setNewTask] = useState({ name: '', description: '', priority: 'medium', estimated_hours: '' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: async () => {
      let q = supabase.from('tasks').select('*, employees(name)').order('created_at', { ascending: false });
      if (selectedProject) q = q.eq('project_id', selectedProject);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['project-time-entries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_entries').select('project_id, duration_minutes').not('duration_minutes', 'is', null);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('id, name').eq('status', 'active').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('projects').insert({
        name: newProject.name,
        description: newProject.description || null,
        client_name: newProject.client_name || null,
        budget_hours: newProject.budget_hours ? Number(newProject.budget_hours) : null,
        color: newProject.color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowNewProject(false);
      setNewProject({ name: '', description: '', client_name: '', budget_hours: '', color: '#3B82F6' });
      toast({ title: 'Projeto criado com sucesso!' });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const createTask = useMutation({
    mutationFn: async () => {
      if (!selectedProject) throw new Error('Selecione um projeto');
      const { error } = await supabase.from('tasks').insert({
        project_id: selectedProject,
        name: newTask.name,
        description: newTask.description || null,
        priority: newTask.priority,
        estimated_hours: newTask.estimated_hours ? Number(newTask.estimated_hours) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowNewTask(false);
      setNewTask({ name: '', description: '', priority: 'medium', estimated_hours: '' });
      toast({ title: 'Tarefa criada com sucesso!' });
    },
    onError: (err: Error) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase.from('tasks').update({
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Status atualizado!' });
    },
  });

  const getProjectHours = (projectId: string) => {
    const entries = timeEntries.filter((e) => e.project_id === projectId);
    const total = entries.reduce((sum: number, e) => sum + (e.duration_minutes || 0), 0);
    return Math.round(total / 60 * 10) / 10;
  };

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos & Tarefas</h1>
          <p className="text-muted-foreground">Gerencie projetos e rastreie tempo por tarefa</p>
        </div>
        <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome *</Label><Input value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Descrição</Label><Textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cliente</Label><Input value={newProject.client_name} onChange={e => setNewProject(p => ({ ...p, client_name: e.target.value }))} /></div>
                <div><Label>Horas Orçadas</Label><Input type="number" value={newProject.budget_hours} onChange={e => setNewProject(p => ({ ...p, budget_hours: e.target.value }))} /></div>
              </div>
              <div><Label>Cor</Label><Input type="color" value={newProject.color} onChange={e => setNewProject(p => ({ ...p, color: e.target.value }))} className="h-10 w-20" /></div>
              <Button onClick={() => createProject.mutate()} disabled={!newProject.name || createProject.isPending} className="w-full">
                {createProject.isPending ? 'Criando...' : 'Criar Projeto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar projeto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Projetos ({filteredProjects.length})</h2>
          {isLoading ? <p className="text-muted-foreground">Carregando...</p> : filteredProjects.map((project) => {
            const hours = getProjectHours(project.id);
            const isSelected = selectedProject === project.id;
            return (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedProject(isSelected ? null : project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: project.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      {project.client_name && <p className="text-xs text-muted-foreground">{project.client_name}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-[10px] ${statusColors[project.status] || ''}`}>{project.status}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {hours}h {project.budget_hours ? `/ ${project.budget_hours}h` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredProjects.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center py-8">Nenhum projeto encontrado</p>
          )}
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Tarefas {selectedProject ? `(${tasks.length})` : '— Selecione um projeto'}
            </h2>
            {selectedProject && (
              <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Tarefa</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Nome *</Label><Input value={newTask.name} onChange={e => setNewTask(t => ({ ...t, name: e.target.value }))} /></div>
                    <div><Label>Descrição</Label><Textarea value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prioridade</Label>
                        <Select value={newTask.priority} onValueChange={v => setNewTask(t => ({ ...t, priority: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Horas Estimadas</Label><Input type="number" value={newTask.estimated_hours} onChange={e => setNewTask(t => ({ ...t, estimated_hours: e.target.value }))} /></div>
                    </div>
                    <Button onClick={() => createTask.mutate()} disabled={!newTask.name || createTask.isPending} className="w-full">
                      {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!selectedProject ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Selecione um projeto à esquerda para ver suas tarefas</CardContent></Card>
          ) : tasks.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma tarefa neste projeto</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {Object.entries(taskStatusConfig).map(([statusKey, cfg]) => {
                const statusTasks = tasks.filter((t) => t.status === statusKey);
                if (statusTasks.length === 0) return null;
                return (
                  <div key={statusKey}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <cfg.icon className="h-4 w-4" /> {cfg.label} ({statusTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {statusTasks.map((task: any) => (
                        <Card key={task.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-3 flex items-center gap-3">
                            <button
                              onClick={() => {
                                const next = statusKey === 'todo' ? 'in_progress' : statusKey === 'in_progress' ? 'done' : 'todo';
                                updateTaskStatus.mutate({ taskId: task.id, status: next });
                              }}
                              className="shrink-0"
                            >
                              <cfg.icon className={`h-5 w-5 ${statusKey === 'done' ? 'text-green-600' : statusKey === 'in_progress' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${statusKey === 'done' ? 'line-through text-muted-foreground' : ''}`}>{task.name}</p>
                              {task.employees?.name && <p className="text-xs text-muted-foreground">{task.employees.name}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${priorityColors[task.priority] || ''}`}>{task.priority}</Badge>
                              {task.estimated_hours && (
                                <span className="text-xs text-muted-foreground">{task.estimated_hours}h</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
