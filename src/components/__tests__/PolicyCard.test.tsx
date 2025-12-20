import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolicyCard } from '../policies/PolicyCard';

const mockPolicy = {
  id: '1',
  name: 'Default Policy',
  description: 'Standard monitoring',
  screenshot_interval: 300,
  activity_tracking: true,
  app_tracking: true,
  url_tracking: true,
  keystroke_tracking: false,
  location_tracking: false,
  idle_detection: true,
  is_active: true,
};

describe('PolicyCard', () => {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders policy name', () => {
    render(<PolicyCard policy={mockPolicy} {...handlers} />);
    expect(screen.getByText('Default Policy')).toBeInTheDocument();
  });

  it('shows screenshot interval', () => {
    render(<PolicyCard policy={mockPolicy} {...handlers} />);
    expect(screen.getByText(/5 min/)).toBeInTheDocument();
  });

  it('shows enabled features', () => {
    render(<PolicyCard policy={mockPolicy} {...handlers} />);
    expect(screen.getByText('Screenshots')).toBeInTheDocument();
    expect(screen.getByText('Atividade')).toBeInTheDocument();
  });

  it('calls onEdit when edit clicked', () => {
    render(<PolicyCard policy={mockPolicy} {...handlers} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(handlers.onEdit).toHaveBeenCalled();
  });

  it('shows active badge', () => {
    render(<PolicyCard policy={mockPolicy} {...handlers} />);
    expect(screen.getByText('Ativa')).toBeInTheDocument();
  });
});
