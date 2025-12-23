export const reportAggregator = {
  daily: (data: any[]) => data.reduce((acc, item) => { const date = new Date(item.date).toISOString().split('T')[0]; acc[date] = acc[date] || []; acc[date].push(item); return acc; }, {} as Record<string, any[]>),
  weekly: (data: any[]) => data.reduce((acc, item) => { const d = new Date(item.date); const week = Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7); const key = d.getFullYear() + '-W' + week; acc[key] = acc[key] || []; acc[key].push(item); return acc; }, {} as Record<string, any[]>),
  monthly: (data: any[]) => data.reduce((acc, item) => { const key = new Date(item.date).toISOString().slice(0, 7); acc[key] = acc[key] || []; acc[key].push(item); return acc; }, {} as Record<string, any[]>),
  summarize: (groups: Record<string, any[]>) => Object.entries(groups).map(([period, items]) => ({ period, count: items.length, items })),
};
