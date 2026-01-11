import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadZone } from '../UploadZone';
describe('UploadZone', () => {
  it('renders', () => { render(<UploadZone onUpload={vi.fn()} />); expect(screen.getByText(/drag and drop/i)).toBeInTheDocument(); });
  it('accepts files', () => { const onUpload = vi.fn(); render(<UploadZone onUpload={onUpload} />); const file = new File(['test'], 'test.txt', { type: 'text/plain' }); fireEvent.drop(screen.getByTestId('upload-zone'), { dataTransfer: { files: [file] } }); expect(onUpload).toHaveBeenCalled(); });
  it('shows accepted types', () => { render(<UploadZone onUpload={vi.fn()} accept=".pdf,.doc" />); expect(screen.getByText(/pdf, doc/i)).toBeInTheDocument(); });
});