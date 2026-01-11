import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from '../ExportButton';
describe('ExportButton', () => {
  it('renders button', () => { render(<ExportButton onExport={vi.fn()} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('shows format options', () => { render(<ExportButton onExport={vi.fn()} formats={['csv', 'pdf', 'xlsx']} />); fireEvent.click(screen.getByRole('button')); expect(screen.getByText('CSV')).toBeInTheDocument(); expect(screen.getByText('PDF')).toBeInTheDocument(); });
  it('calls onExport with format', () => { const onExport = vi.fn(); render(<ExportButton onExport={onExport} formats={['csv']} />); fireEvent.click(screen.getByRole('button')); fireEvent.click(screen.getByText('CSV')); expect(onExport).toHaveBeenCalledWith('csv'); });
  it('shows loading state', () => { render(<ExportButton onExport={vi.fn()} loading />); expect(screen.getByRole('button')).toBeDisabled(); });
});