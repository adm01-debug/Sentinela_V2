export const reportPresenter = {
  toView: (r: any) => ({ id: r.id, name: r.name, type: r.type, typeLabel: reportPresenter.getTypeLabel(r.type), status: r.status, statusColor: r.status === 'completed' ? 'green' : r.status === 'failed' ? 'red' : 'yellow', createdAt: new Date(r.created_at).toLocaleString('pt-BR') }),
  getTypeLabel: (type: string) => ({ daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal', productivity: 'Produtividade' }[type] || type),
  toList: (reports: any[]) => reports.map(r => reportPresenter.toView(r)),
};
