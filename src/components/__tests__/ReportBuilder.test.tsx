import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportBuilder } from '../ReportBuilder';
describe('ReportBuilder', () => {
  it('renders builder', () => { render(<ReportBuilder onGenerate={vi.fn()} />); expect(screen.getByText(/report builder/i)).toBeInTheDocument(); });
  it('selects report type', () => { render(<ReportBuilder onGenerate={vi.fn()} />); fireEvent.click(screen.getByLabelText(/report type/i)); fireEvent.click(screen.getByText('Activity Report')); expect(screen.getByText('Activity Report')).toBeInTheDocument(); });
  it('adds filters', () => { render(<ReportBuilder onGenerate={vi.fn()} />); fireEvent.click(screen.getByText(/add filter/i)); expect(screen.getByTestId('filter-row')).toBeInTheDocument(); });
  it('generates report', () => { const onGenerate = vi.fn(); render(<ReportBuilder onGenerate={onGenerate} />); fireEvent.click(screen.getByText(/generate/i)); expect(onGenerate).toHaveBeenCalled(); });
});