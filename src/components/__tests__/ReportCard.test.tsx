import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportCard } from '../ReportCard';
describe('ReportCard', () => {
  const report = { id: '1', title: 'Monthly Report', type: 'activity', createdAt: '2026-01-01', status: 'completed' };
  it('renders report', () => { render(<ReportCard report={report} />); expect(screen.getByText('Monthly Report')).toBeInTheDocument(); });
  it('shows status', () => { render(<ReportCard report={report} />); expect(screen.getByText('completed')).toBeInTheDocument(); });
  it('handles download', () => { const onDownload = vi.fn(); render(<ReportCard report={report} onDownload={onDownload} />); fireEvent.click(screen.getByRole('button', { name: /download/i })); expect(onDownload).toHaveBeenCalled(); });
});