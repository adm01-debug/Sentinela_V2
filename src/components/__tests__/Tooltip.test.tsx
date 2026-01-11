import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../Tooltip';
describe('Tooltip', () => {
  it('renders trigger', () => { render(<Tooltip content="Help text"><button>Hover me</button></Tooltip>); expect(screen.getByText('Hover me')).toBeInTheDocument(); });
  it('shows on hover', async () => { render(<Tooltip content="Help text"><button>Hover me</button></Tooltip>); fireEvent.mouseEnter(screen.getByText('Hover me')); expect(await screen.findByText('Help text')).toBeInTheDocument(); });
  it('hides on leave', async () => { render(<Tooltip content="Help text"><button>Hover me</button></Tooltip>); fireEvent.mouseEnter(screen.getByText('Hover me')); await screen.findByText('Help text'); fireEvent.mouseLeave(screen.getByText('Hover me')); expect(screen.queryByText('Help text')).not.toBeInTheDocument(); });
});