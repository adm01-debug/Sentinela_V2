import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataCard } from '../DataCard';

describe('DataCard', () => {
  const data = [
    { label: 'Name', value: 'John' },
    { label: 'Email', value: 'john@test.com' },
  ];

  it('renders data', () => {
    render(<DataCard title="Details" data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<DataCard title="User Info" data={data} />);
    expect(screen.getByText('User Info')).toBeInTheDocument();
  });

  it('renders actions', () => {
    const onEdit = vi.fn();
    render(<DataCard data={data} actions={[{ label: 'Edit', onClick: onEdit }]} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
  });
});