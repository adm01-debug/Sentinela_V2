import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="Nenhum resultado" />);
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<EmptyState title="Vazio" description="Adicione itens" />);
    expect(screen.getByText('Adicione itens')).toBeInTheDocument();
  });

  it('should handle action click', () => {
    const onClick = vi.fn();
    render(<EmptyState title="Vazio" action={{ label: 'Adicionar', onClick }} />);
    fireEvent.click(screen.getByText('Adicionar'));
    expect(onClick).toHaveBeenCalled();
  });
});
