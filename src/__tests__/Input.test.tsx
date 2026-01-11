import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../components/ui/Input';

describe('Input', () => {
  it('renders with label', () => { render(<Input label="Email" />); expect(screen.getByText('Email')).toBeInTheDocument(); });
  it('shows error message', () => { render(<Input error="Required" />); expect(screen.getByText('Required')).toBeInTheDocument(); });
});