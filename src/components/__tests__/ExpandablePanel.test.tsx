import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandablePanel } from '../ExpandablePanel';
describe('ExpandablePanel', () => {
  it('renders title', () => { render(<ExpandablePanel title="Details"><div>Content</div></ExpandablePanel>); expect(screen.getByText('Details')).toBeInTheDocument(); });
  it('expands on click', () => { render(<ExpandablePanel title="Details"><div>Content</div></ExpandablePanel>); fireEvent.click(screen.getByText('Details')); expect(screen.getByText('Content')).toBeInTheDocument(); });
  it('starts expanded', () => { render(<ExpandablePanel title="Details" defaultExpanded><div>Content</div></ExpandablePanel>); expect(screen.getByText('Content')).toBeInTheDocument(); });
});