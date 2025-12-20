import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualList, useVirtualScroll } from '../VirtualList';
import { renderHook, act } from '@testing-library/react';

describe('VirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('renders visible items only', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={200}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
        keyExtractor={(item) => String(item.id)}
      />
    );

    // With overscan=5, should render around 5 + ceil(200/40) + 5 = 15 items
    const renderedItems = screen.getAllByTestId(/item-\d+/);
    expect(renderedItems.length).toBeLessThan(100);
    expect(renderedItems.length).toBeGreaterThan(0);
  });

  it('shows empty component when no items', () => {
    render(
      <VirtualList
        items={[]}
        itemHeight={40}
        containerHeight={200}
        renderItem={() => <div>Item</div>}
        emptyComponent={<div data-testid="empty">Vazio</div>}
      />
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });

  it('shows default empty message when no items and no custom empty component', () => {
    render(
      <VirtualList
        items={[]}
        itemHeight={40}
        containerHeight={200}
        renderItem={() => <div>Item</div>}
      />
    );

    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('shows loading indicator when loading', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={200}
        renderItem={(item) => <div>{item.name}</div>}
        loading={true}
      />
    );

    const loadingIndicator = document.querySelector('.animate-spin');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('uses custom loading component', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={200}
        renderItem={(item) => <div>{item.name}</div>}
        loading={true}
        loadingComponent={<div data-testid="custom-loading">Carregando...</div>}
      />
    );

    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={200}
        renderItem={(item) => <div>{item.name}</div>}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('useVirtualScroll', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  it('calculates visible items correctly', () => {
    const { result } = renderHook(() => 
      useVirtualScroll(items, 40, 200, 5)
    );

    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    expect(result.current.visibleItems.length).toBeLessThan(items.length);
    expect(result.current.totalHeight).toBe(100 * 40);
    expect(result.current.offsetTop).toBe(0);
  });

  it('updates on scroll', () => {
    const { result } = renderHook(() => 
      useVirtualScroll(items, 40, 200, 5)
    );

    const initialStartIndex = result.current.visibleStartIndex;

    act(() => {
      // Simulate scroll
      const mockEvent = {
        currentTarget: { scrollTop: 400 }
      } as React.UIEvent<HTMLDivElement>;
      result.current.onScroll(mockEvent);
    });

    expect(result.current.visibleStartIndex).toBeGreaterThan(initialStartIndex);
  });

  it('respects overscan parameter', () => {
    const { result: resultWithOverscan } = renderHook(() => 
      useVirtualScroll(items, 40, 200, 10)
    );

    const { result: resultWithoutOverscan } = renderHook(() => 
      useVirtualScroll(items, 40, 200, 0)
    );

    expect(resultWithOverscan.current.visibleItems.length)
      .toBeGreaterThan(resultWithoutOverscan.current.visibleItems.length);
  });
});
