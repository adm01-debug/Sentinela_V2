import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { useDepartments, useCreateDepartment, useDeleteDepartment } from '@/hooks/useDepartments';

export default function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { data: departments } = useDepartments({ search });
  const create = useCreateDepartment();
  const remove = useDeleteDepartment();

  const handleCreate = async () => { await create.mutateAsync({ name }); setOpen(false); setName(''); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Departamentos</h1><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo</Button></div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments?.map(dept => (
          <Card key={dept.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />{dept.name}</CardTitle><CardDescription>{dept.employeeCount} funcionários</CardDescription></div>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to={`/departments/${dept.id}`}><Edit className="mr-2 h-4 w-4" />Editar</Link></DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(dept.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{dept.description}</p></CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Novo Departamento</DialogTitle></DialogHeader><Input label="Nome" value={name} onChange={e => setName(e.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={handleCreate} loading={create.isPending}>Criar</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}