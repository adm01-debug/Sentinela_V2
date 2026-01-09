import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown, DropdownItem } from '../Dropdown';

describe('Dropdown', () => {
  it('opens on trigger click', () => {
    render(
      <Dropdown trigger={<button>Open</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </Dropdown>
    );
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Item 1')).toBeVisible();
  });

  it('closes on item click', () => {
    const onClick = vi.fn();
    render(
      <Dropdown trigger={<button>Open</button>}>
        <DropdownItem onClick={onClick}>Item</DropdownItem>
      </Dropdown>
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Item'));
    expect(onClick).toHaveBeenCalled();
  });

  it('closes on outside click', () => {
    render(
      <Dropdown trigger={<button>Open</button>}>
        <DropdownItem>Item</DropdownItem>
      </Dropdown>
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(document.body);
    expect(screen.queryByText('Item')).not.toBeVisible();
  });
});