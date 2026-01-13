import React from 'react';
export interface TimelineItem { id: string; title: string; description?: string; date?: string; icon?: React.ReactNode; color?: string; }
export interface DataTimelineProps { items: TimelineItem[]; className?: string; }
export const DataTimeline: React.FC<DataTimelineProps> = ({ items, className }) => (
  <div className={className}>{items.map((item, i) => (
    <div key={item.id} style={{ display: 'flex', gap: 16, paddingBottom: i < items.length - 1 ? 24 : 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: item.color || '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{item.icon || '●'}</div>
        {i < items.length - 1 && <div style={{ width: 2, flex: 1, backgroundColor: '#e8e8e8', marginTop: 8 }} />}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.title}</h4>
        {item.date && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>{item.date}</p>}
        {item.description && <p style={{ margin: '8px 0 0', fontSize: 14, color: '#666' }}>{item.description}</p>}
      </div>
    </div>
  ))}</div>
);
export default DataTimeline;
