import React from 'react';
export interface ChartContainerProps { title?: string; subtitle?: string; children: React.ReactNode; loading?: boolean; error?: string; width?: string | number; height?: string | number; className?: string; }
export const ChartContainer: React.FC<ChartContainerProps> = ({ title, subtitle, children, loading, error, width = '100%', height = 'auto', className }) => (
  <div className={className} style={{ width, height, padding: 16, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    {(title || subtitle) && (
      <div style={{ marginBottom: 16 }}>
        {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>}
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>{subtitle}</p>}
      </div>
    )}
    {loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>Loading...</div>
      : error ? <div style={{ color: '#ff4d4f', textAlign: 'center', padding: 20 }}>{error}</div>
      : children}
  </div>
);
export default ChartContainer;
