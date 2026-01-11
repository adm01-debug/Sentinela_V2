import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineEvent } from '../TimelineEvent';
describe('TimelineEvent', () => {
  const event = { id: '1', title: 'Login', time: '10:00 AM', type: 'auth', description: 'User logged in' };
  it('renders', () => { render(<TimelineEvent event={event} />); expect(screen.getByText('Login')).toBeInTheDocument(); });
  it('shows time', () => { render(<TimelineEvent event={event} />); expect(screen.getByText('10:00 AM')).toBeInTheDocument(); });
  it('shows type icon', () => { render(<TimelineEvent event={event} />); expect(screen.getByTestId('icon-auth')).toBeInTheDocument(); });
  it('expands details', () => { render(<TimelineEvent event={event} expandable />); fireEvent.click(screen.getByText('Login')); expect(screen.getByText('User logged in')).toBeInTheDocument(); });
});