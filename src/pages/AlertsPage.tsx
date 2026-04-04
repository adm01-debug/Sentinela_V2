import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts } from '@/hooks';
import { AlertList } from '@/components/AlertList';
import { AlertFilters } from '@/components/AlertFilters';
import { Button  } from '@/components/ui/button';

export const AlertsPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<{ severity?: string; acknowledged?: boolean }>({});
  const { data: alerts, isLoading } = useAlerts(filters);
  const acknowledgeAlert = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAllAlerts();

  const unacknowledgedCount = alerts?.data.filter(a => !a.acknowledged).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.alerts')}</h1>
        {unacknowledgedCount > 0 && (
          <Button variant="outline" onClick={() => acknowledgeAll.mutate()}>
            Acknowledge All ({unacknowledgedCount})
          </Button>
        )}
      </div>
      <AlertFilters filters={filters} onChange={setFilters} />
      <AlertList
        alerts={alerts?.data || []}
        isLoading={isLoading}
        onAcknowledge={(id) => acknowledgeAlert.mutate(id)}
      />
    </div>
  );
};

export default AlertsPage;