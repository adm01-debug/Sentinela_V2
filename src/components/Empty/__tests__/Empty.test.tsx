import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Empty } from '../Empty';

describe('Empty', () => {
  it('renders default empty state', () => {
    render(<Empty title="Nenhum item" />);
    expect(screen.getByText('Nenhum item')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<Empty title="Vazio" description="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<Empty icon={<span data-testid="custom-icon">📭</span>} title="Empty" description="Empty" />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const onClick = vi.fn();
    render(<Empty title="Vazio" description="Empty" action={<button onClick={onClick}>Add</button>} />);
    fireEvent.click(screen.getByText('Add'));
    expect(onClick).toHaveBeenCalled();
  });
});
