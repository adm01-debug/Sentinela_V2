import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { FileText } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState icon={FileText} title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState icon={FileText} title="No data" description="Try again" />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState icon={FileText} title="No data" action={<button>Click</button>} />);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });
});
