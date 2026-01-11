import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from '../FilePreview';
describe('FilePreview', () => {
  const file = { name: 'document.pdf', type: 'application/pdf', size: 1024, url: '/file.pdf' };
  it('renders', () => { render(<FilePreview file={file} />); expect(screen.getByText('document.pdf')).toBeInTheDocument(); });
  it('shows size', () => { render(<FilePreview file={file} />); expect(screen.getByText('1 KB')).toBeInTheDocument(); });
  it('handles remove', () => { const onRemove = vi.fn(); render(<FilePreview file={file} onRemove={onRemove} />); fireEvent.click(screen.getByRole('button', { name: /remove/i })); expect(onRemove).toHaveBeenCalled(); });
});