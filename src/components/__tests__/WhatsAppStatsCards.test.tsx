import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsAppStatsCards } from '../whatsapp/WhatsAppStatsCards';

const mockStats = {
  totalMessages: 1500,
  sent: 1200,
  delivered: 1100,
  read: 900,
  failed: 50,
  templates: 10,
  approvedTemplates: 8,
};

describe('WhatsAppStatsCards', () => {
  it('renders message stats', () => {
    render(<WhatsAppStatsCards stats={mockStats} />);

    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('1100')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
  });

  it('shows failed count', () => {
    render(<WhatsAppStatsCards stats={mockStats} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('shows templates ratio', () => {
    render(<WhatsAppStatsCards stats={mockStats} />);
    
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });
});
