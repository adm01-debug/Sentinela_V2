import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('shows on hover', async () => {
    render(<Tooltip content="Tip text"><button>Hover me</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.getByText('Tip text')).toBeVisible());
  });

  it('hides on mouse leave', async () => {
    render(<Tooltip content="Tip"><button>Hover</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Hover'));
    fireEvent.mouseLeave(screen.getByText('Hover'));
    await waitFor(() => expect(screen.queryByText('Tip')).not.toBeVisible());
  });

  it('positions correctly', () => {
    render(<Tooltip content="Tip" position="top"><button>Button</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Button'));
    expect(screen.getByTestId('tooltip')).toHaveClass('top');
  });
});