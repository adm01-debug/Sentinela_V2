import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover } from '../Popover';
describe('Popover', () => {
  it('renders trigger', () => { render(<Popover trigger={<button>Open</button>} content="Content" />); expect(screen.getByText('Open')).toBeInTheDocument(); });
  it('shows content on click', () => { render(<Popover trigger={<button>Open</button>} content="Content" />); fireEvent.click(screen.getByText('Open')); expect(screen.getByText('Content')).toBeInTheDocument(); });
});