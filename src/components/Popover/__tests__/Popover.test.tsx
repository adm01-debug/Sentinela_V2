import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from '../Popover';

describe('Popover', () => {
  it('shows on trigger click', async () => {
    render(<Popover trigger={<button>Open</button>}>Popover content</Popover>);
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByText('Popover content')).toBeVisible());
  });

  it('renders title', () => {
    render(<Popover trigger={<button>Open</button>} title="Title" isOpen>Content</Popover>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    render(<Popover trigger={<button>Open</button>}>Content</Popover>);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(document.body);
    await waitFor(() => expect(screen.queryByText('Content')).not.toBeVisible());
  });
});