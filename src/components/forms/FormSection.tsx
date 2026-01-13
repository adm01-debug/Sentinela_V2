import React from 'react';
export interface FormSectionProps { title?: string; description?: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean; className?: string; }
export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, collapsible = false, defaultOpen = true, className }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={className} style={{ marginBottom: 24, padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
      {title && (
        <div onClick={() => collapsible && setOpen(!open)} style={{ cursor: collapsible ? 'pointer' : 'default', marginBottom: open ? 16 : 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{title}{collapsible && <span>{open ? '▼' : '▶'}</span>}</h3>
          {description && open && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>{description}</p>}
        </div>
      )}
      {open && children}
    </div>
  );
};
export default FormSection;
