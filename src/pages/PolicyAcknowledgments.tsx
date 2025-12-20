import React, { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyAcknowledgmentsSkeleton } from '@/components/PageSkeletons';

import {
  PolicyStatsCards,
  PolicyAcknowledgmentsTable,
  PolicyFilters,
} from '@/components/policies';
import {
  usePolicies,
  usePolicyAcknowledgments,
  usePendingAcknowledgments,
  usePolicyStats,
} from '@/hooks/usePolicyAcknowledgments';

const PolicyAcknowledgmentsContent = memo(function PolicyAcknowledgmentsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [activeTab, setActiveTab] = useState('acknowledged');

  // Queries
  const { data: policies = [], isLoading: policiesLoading } = usePolicies();
  const { data: acknowledgments = [], isLoading: acksLoading } = usePolicyAcknowledgments();
  const { data: pending = [], isLoading: pendingLoading } = usePendingAcknowledgments();
  const { data: stats, isLoading: statsLoading } = usePolicyStats();

  // Filtered data
  const filteredAcknowledgments = useMemo(() => {
    return acknowledgments.filter((ack) => {
      const matchesSearch = 
        !searchTerm ||
        ack.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ack.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPolicy = 
        selectedPolicy === 'all' || ack.policy_id === selectedPolicy;

      const matchesDate = 
        !dateRange ||
        (new Date(ack.acknowledged_at) >= dateRange.from &&
         new Date(ack.acknowledged_at) <= dateRange.to);

      return matchesSearch && matchesPolicy && matchesDate;
    });
  }, [acknowledgments, searchTerm, selectedPolicy, dateRange]);

  const filteredPending = useMemo(() => {
    return pending.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPolicy =
        selectedPolicy === 'all' || p.policyId === selectedPolicy;

      return matchesSearch && matchesPolicy;
    });
  }, [pending, searchTerm, selectedPolicy]);

  // Callbacks
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedPolicy('all');
    setDateRange(undefined);
  }, []);

  const isLoading = policiesLoading || acksLoading || pendingLoading || statsLoading;

  if (isLoading && !acknowledgments.length) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <PolicyAcknowledgmentsSkeleton />
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

        <PolicyStatsCards stats={stats} isLoading={statsLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Aceites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PolicyFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPolicy={selectedPolicy}
              onPolicyChange={setSelectedPolicy}
              policies={policies}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearFilters}
            />

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
                <PolicyAcknowledgmentsTable
                  acknowledgments={filteredAcknowledgments}
                  isLoading={acksLoading}
                />
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
                          <div className="font-medium">{p.employee.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {p.employee.email}
                          </div>
                        </div>
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
