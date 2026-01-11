import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../components/StatCard';

describe('StatCard', () => {
  it('displays title and value', () => { render(<StatCard title="Users" value={100} />); expect(screen.getByText('Users')).toBeInTheDocument(); expect(screen.getByText('100')).toBeInTheDocument(); });
  it('shows positive trend', () => { render(<StatCard title="Growth" value="50%" trend={10} />); expect(screen.getByText('+10%')).toBeInTheDocument(); });
});