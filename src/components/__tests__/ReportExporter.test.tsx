import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportExporter } from '../ReportExporter';
describe('ReportExporter', () => {
  it('renders exporter', () => { render(<ReportExporter onExport={vi.fn()} />); expect(screen.getByText(/export/i)).toBeInTheDocument(); });
  it('shows format options', () => { render(<ReportExporter onExport={vi.fn()} formats={['pdf', 'csv']} />); expect(screen.getByText('PDF')).toBeInTheDocument(); });
  it('exports format', () => { const onExport = vi.fn(); render(<ReportExporter onExport={onExport} formats={['pdf']} />); fireEvent.click(screen.getByText('PDF')); expect(onExport).toHaveBeenCalledWith('pdf'); });
});