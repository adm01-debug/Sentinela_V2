import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Empty } from '../Empty';

describe('Empty', () => {
  it('renders default empty state', () => {
    render(<Empty />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<Empty description="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders custom image', () => {
    render(<Empty image="📭" description="Empty" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const onClick = vi.fn();
    render(<Empty description="Empty" action={<button onClick={onClick}>Add</button>} />);
    fireEvent.click(screen.getByText('Add'));
    expect(onClick).toHaveBeenCalled();
  });
});