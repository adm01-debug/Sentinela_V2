import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableItem } from '../DraggableItem';
describe('DraggableItem', () => {
  it('renders', () => { render(<DraggableItem id="1"><div>Content</div></DraggableItem>); expect(screen.getByText('Content')).toBeInTheDocument(); });
  it('drag handle', () => { render(<DraggableItem id="1" showHandle><div>Content</div></DraggableItem>); expect(screen.getByTestId('drag-handle')).toBeInTheDocument(); });
});