import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualList } from '../VirtualList';

describe('VirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: String(i), name: `Item ${i}` }));

  // VirtualList uses containerHeight, not height; and requires keyExtractor
  it('renders list container', () => {
    render(
      <VirtualList
        items={items}
        containerHeight={400}
        itemHeight={40}
        renderItem={(item) => <div>{item.name}</div>}
        keyExtractor={(item) => item.id}
      />
    );
    // Container should be rendered
    expect(document.querySelector('[style*="height: 400px"]')).toBeInTheDocument();
  });

  it('renders visible items', () => {
    render(
      <VirtualList
        items={items}
        containerHeight={400}
        itemHeight={40}
        renderItem={(item) => <div>{item.name}</div>}
        keyExtractor={(item) => item.id}
      />
    );
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('virtualizes items outside viewport', () => {
    render(
      <VirtualList
        items={items}
        containerHeight={400}
        itemHeight={40}
        renderItem={(item) => <div>{item.name}</div>}
        keyExtractor={(item) => item.id}
      />
    );
    // Item 99 should not be rendered initially
    expect(screen.queryByText('Item 99')).not.toBeInTheDocument();
  });

  it('shows empty component when no items', () => {
    render(
      <VirtualList
        items={[]}
        containerHeight={400}
        itemHeight={40}
        renderItem={(item: unknown) => <div>{String(item)}</div>}
        keyExtractor={(_, index) => String(index)}
        emptyComponent={<div>No items</div>}
      />
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
