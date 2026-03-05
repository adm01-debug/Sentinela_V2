import React, { Suspense, memo, useState, useMemo, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  usePolicies,
  usePolicyAcknowledgments,
  usePendingAcknowledgments,
  usePolicyStats,
} from '@/hooks/usePolicyAcknowledgments';

const PolicyAcknowledgmentsContent = memo(function PolicyAcknowledgmentsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('all');
  const [activeTab, setActiveTab] = useState('acknowledged');

  const { data: policies = [], isLoading: policiesLoading } = usePolicies();
  const { data: acknowledgments = [], isLoading: acksLoading } = usePolicyAcknowledgments();
  const { data: pending = [], isLoading: pendingLoading } = usePendingAcknowledgments();
  const { data: stats, isLoading: statsLoading } = usePolicyStats();

  const filteredAcknowledgments = useMemo(() => {
    return acknowledgments.filter((ack) => {
      const matchesSearch =
        !searchTerm ||
        ack.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [acknowledgments, searchTerm]);

  const filteredPending = useMemo(() => {
    return pending.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPolicy =
        selectedPolicy === 'all' || p.policyId === selectedPolicy;

      return matchesSearch && matchesPolicy;
    });
  }, [pending, searchTerm, selectedPolicy]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedPolicy('all');
  }, []);

  const isLoading = policiesLoading || acksLoading || pendingLoading || statsLoading;

  if (isLoading && !acknowledgments.length) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Aceites de Políticas</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore os aceites de políticas pelos funcionários
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Políticas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.total_policies ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ativas</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.active_policies ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aceites</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.total_acknowledgments ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.pending_acknowledgments ?? 0}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Aceites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Política" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {policies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="acknowledged">
                  Aceitos ({filteredAcknowledgments.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendentes ({filteredPending.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="acknowledged">
                {filteredAcknowledgments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum aceite encontrado</div>
                ) : (
                  <div className="space-y-2">
                    {filteredAcknowledgments.map((ack) => (
                      <div key={ack.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{ack.employee_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(ack.acknowledged_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant="default">Aceito</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending">
                <div className="space-y-2">
                  {filteredPending.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum aceite pendente
                    </div>
                  ) : (
                    filteredPending.map((p, i) => (
                      <div
                        key={`${p.policyId}-${p.employee.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{p.employee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {p.employee.email}
                          </div>
                        </div>
                        <Badge variant="secondary">Pendente</Badge>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function PolicyAcknowledgments() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <PolicyAcknowledgmentsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
