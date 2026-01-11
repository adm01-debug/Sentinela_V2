import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualList } from '../VirtualList';
describe('VirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
  it('renders', () => { render(<VirtualList items={items} height={400} itemHeight={40} renderItem={(item) => <div>{item.name}</div>} />); expect(screen.getByText('Item 0')).toBeInTheDocument(); });
  it('virtualizes', () => { render(<VirtualList items={items} height={400} itemHeight={40} renderItem={(item) => <div>{item.name}</div>} />); expect(screen.queryByText('Item 99')).not.toBeInTheDocument(); });
});