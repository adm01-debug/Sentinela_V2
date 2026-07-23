import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, User, ZoomIn, ZoomOut, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Node {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'employee';
  route?: string;
  count?: number;
  children?: Node[];
}

const iconFor = (type: Node['type']) => {
  switch (type) {
    case 'company': return Building2;
    case 'department': return Building2;
    case 'team': return Users;
    case 'employee': return User;
  }
};

interface OrgNodeCardProps {
  node: Node;
  highlight: string;
  onClick: () => void;
}

function OrgNodeCard({ node, highlight, onClick }: OrgNodeCardProps) {
  const Icon = iconFor(node.type);
  const matches =
    highlight.length > 0 && node.name.toLowerCase().includes(highlight.toLowerCase());

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-1 rounded-lg border bg-card px-4 py-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        matches ? 'ring-2 ring-primary' : ''
      }`}
      aria-label={`${node.type} ${node.name}`}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{node.name}</span>
      {typeof node.count === 'number' && (
        <Badge variant="secondary" className="text-xs">{node.count}</Badge>
      )}
    </button>
  );
}

function renderTree(node: Node, highlight: string, onNavigate: (n: Node) => void) {
  const card = <OrgNodeCard node={node} highlight={highlight} onClick={() => onNavigate(node)} />;
  if (!node.children || node.children.length === 0) return card;
  return (
    <TreeNode label={card}>
      {node.children.map((child) => (
        <TreeNode key={child.id} label={renderTree(child, highlight, onNavigate)} />
      ))}
    </TreeNode>
  );
}

export default function OrgChartPage() {
  const nav = useNavigate();
  const [tree, setTree] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: companies }, { data: depts }, { data: teams }, { data: emps }] =
          await Promise.all([
            supabase.from('companies').select('id, name').limit(1),
            supabase.from('teams').select('id, name, department, company_id').limit(500),
            supabase.from('teams').select('id, name, company_id').limit(500),
            supabase.from('employees').select('id, name, team_id, department, company_id').limit(2000),
          ]);

        const company = companies?.[0];
        if (!company) {
          setTree(null);
          return;
        }

        // Build hierarchy: company -> department -> team -> employee
        const deptMap = new Map<string, Node>();
        for (const t of depts ?? []) {
          const deptName = (t.department as string) || 'Sem departamento';
          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, {
              id: `dept-${deptName}`,
              name: deptName,
              type: 'department',
              children: [],
              count: 0,
            });
          }
        }
        // Ensure at least one department for employees without team
        if (!deptMap.has('Sem departamento')) {
          deptMap.set('Sem departamento', {
            id: 'dept-none',
            name: 'Sem departamento',
            type: 'department',
            children: [],
            count: 0,
          });
        }

        const teamNodes = new Map<string, Node>();
        for (const t of teams ?? []) {
          teamNodes.set(t.id, {
            id: t.id,
            name: t.name,
            type: 'team',
            route: `/admin/teams/${t.id}`,
            children: [],
            count: 0,
          });
        }

        for (const e of emps ?? []) {
          const empNode: Node = {
            id: e.id,
            name: e.name,
            type: 'employee',
            route: `/employees/${e.id}`,
          };
          const team = e.team_id ? teamNodes.get(e.team_id) : undefined;
          if (team) {
            team.children!.push(empNode);
            team.count = (team.count ?? 0) + 1;
          } else {
            const deptName = (e.department as string) || 'Sem departamento';
            const dept = deptMap.get(deptName) ?? deptMap.get('Sem departamento')!;
            dept.children!.push(empNode);
            dept.count = (dept.count ?? 0) + 1;
          }
        }

        // Attach teams to first department bucket if no explicit dept
        const defaultDept = deptMap.get('Sem departamento')!;
        for (const team of teamNodes.values()) {
          defaultDept.children!.push(team);
          defaultDept.count = (defaultDept.count ?? 0) + (team.count ?? 0);
        }

        const root: Node = {
          id: company.id,
          name: company.name,
          type: 'company',
          children: Array.from(deptMap.values()).filter((d) => (d.children?.length ?? 0) > 0),
        };
        setTree(root);
      } catch (err) {
        logger.error('OrgChart load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNavigate = (node: Node) => {
    if (node.route) nav(node.route);
  };

  const totalEmployees = useMemo(() => {
    if (!tree) return 0;
    let n = 0;
    const walk = (nd: Node) => {
      if (nd.type === 'employee') n += 1;
      nd.children?.forEach(walk);
    };
    walk(tree);
    return n;
  }, [tree]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Organograma</h1>
          <p className="text-sm text-muted-foreground">
            {totalEmployees} colaborador(es) na estrutura
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Buscar no organograma"
              className="pl-8 w-64"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="icon" variant="outline" aria-label="Diminuir zoom" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Aumentar zoom" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estrutura Hierárquica</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !tree ? (
            <p className="text-center text-muted-foreground py-16">Nenhuma empresa cadastrada.</p>
          ) : (
            <div className="overflow-auto py-6">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 200ms' }}>
                <Tree
                  lineWidth="1px"
                  lineColor="hsl(var(--border))"
                  lineBorderRadius="8px"
                  label={
                    <OrgNodeCard node={tree} highlight={search} onClick={() => handleNavigate(tree)} />
                  }
                >
                  {tree.children?.map((c) => (
                    <TreeNode key={c.id} label={renderTree(c, search, handleNavigate)} />
                  ))}
                </Tree>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
