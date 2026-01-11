import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetGrid } from '../WidgetGrid';
describe('WidgetGrid', () => {
  const widgets = [{ id: '1', type: 'stats', title: 'Users' }, { id: '2', type: 'chart', title: 'Activity' }];
  it('renders widgets', () => { render(<WidgetGrid widgets={widgets} renderWidget={(w) => <div>{w.title}</div>} />); expect(screen.getByText('Users')).toBeInTheDocument(); });
  it('applies columns', () => { const { container } = render(<WidgetGrid widgets={widgets} columns={3} renderWidget={(w) => <div>{w.title}</div>} />); expect(container.firstChild).toHaveClass('grid-cols-3'); });
});