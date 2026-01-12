import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyButton } from '../CopyButton';

Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

describe('CopyButton', () => {
  it('should render copy button', () => {
    render(<CopyButton text="test" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should copy text on click', async () => {
    render(<CopyButton text="copy me" />);
    fireEvent.click(screen.getByRole('button'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy me');
  });
});
