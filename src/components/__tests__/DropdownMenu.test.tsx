import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownMenu } from '../DropdownMenu';
describe('DropdownMenu', () => {
  const items = [{ label: 'Edit', onClick: vi.fn() }, { label: 'Delete', onClick: vi.fn() }];
  it('renders trigger', () => { render(<DropdownMenu trigger={<button>Menu</button>} items={items} />); expect(screen.getByText('Menu')).toBeInTheDocument(); });
  it('opens on click', () => { render(<DropdownMenu trigger={<button>Menu</button>} items={items} />); fireEvent.click(screen.getByText('Menu')); expect(screen.getByText('Edit')).toBeInTheDocument(); });
  it('executes action', () => { render(<DropdownMenu trigger={<button>Menu</button>} items={items} />); fireEvent.click(screen.getByText('Menu')); fireEvent.click(screen.getByText('Edit')); expect(items[0].onClick).toHaveBeenCalled(); });
});