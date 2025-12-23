export const activityPresenter = {
  toView: (a: any) => ({ id: a.id, application: a.application, title: a.title, duration: a.duration, durationFormatted: activityPresenter.formatDuration(a.duration), isProductive: a.is_productive, productivityLabel: a.is_productive ? 'Produtivo' : 'Improdutivo', type: a.type, startedAt: new Date(a.started_at).toLocaleString('pt-BR') }),
  formatDuration: (seconds: number) => { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); return h > 0 ? h + 'h ' + m + 'm' : m + 'm'; },
  toList: (activities: any[]) => activities.map(a => activityPresenter.toView(a)),
};
