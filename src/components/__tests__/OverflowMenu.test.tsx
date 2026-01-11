import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverflowMenu } from '../OverflowMenu';
describe('OverflowMenu', () => {
  const items = [{ label: 'Edit', onClick: vi.fn() }, { label: 'Delete', onClick: vi.fn() }];
  it('renders trigger', () => { render(<OverflowMenu items={items} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('opens menu', () => { render(<OverflowMenu items={items} />); fireEvent.click(screen.getByRole('button')); expect(screen.getByText('Edit')).toBeInTheDocument(); });
});