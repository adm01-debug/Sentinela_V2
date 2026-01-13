import React from 'react';
export interface DataCardProps { title?: string; subtitle?: string; value?: string | number; change?: number; icon?: React.ReactNode; footer?: React.ReactNode; loading?: boolean; onClick?: () => void; className?: string; }
export const DataCard: React.FC<DataCardProps> = ({ title, subtitle, value, change, icon, footer, loading, onClick, className }) => (
  <div className={className} onClick={onClick} style={{ padding: 20, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: onClick ? 'pointer' : 'default' }}>
    {loading ? <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div> : (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>{title && <h4 style={{ margin: 0, fontSize: 14, color: '#666' }}>{title}</h4>}{subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>{subtitle}</p>}</div>
          {icon && <div style={{ fontSize: 24 }}>{icon}</div>}
        </div>
        {value !== undefined && <div style={{ marginTop: 12, fontSize: 28, fontWeight: 600 }}>{value}</div>}
        {change !== undefined && <div style={{ marginTop: 4, fontSize: 12, color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>{change >= 0 ? '↑' : '↓'} {Math.abs(change)}%</div>}
        {footer && <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>{footer}</div>}
      </>
    )}
  </div>
);
export default DataCard;
