import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
describe('FormField', () => {
  it('renders label', () => { render(<FormField label="Email"><input /></FormField>); expect(screen.getByText('Email')).toBeInTheDocument(); });
  it('shows required', () => { render(<FormField label="Email" required><input /></FormField>); expect(screen.getByText('*')).toBeInTheDocument(); });
  it('shows error', () => { render(<FormField label="Email" error="Invalid email"><input /></FormField>); expect(screen.getByText('Invalid email')).toBeInTheDocument(); });
  it('shows hint', () => { render(<FormField label="Email" hint="Enter your email"><input /></FormField>); expect(screen.getByText('Enter your email')).toBeInTheDocument(); });
});