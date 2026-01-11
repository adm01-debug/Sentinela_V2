import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageUpload } from '../ImageUpload';
describe('ImageUpload', () => {
  it('renders', () => { render(<ImageUpload onUpload={vi.fn()} />); expect(screen.getByText(/upload/i)).toBeInTheDocument(); });
  it('preview', () => { render(<ImageUpload value="/img.jpg" onUpload={vi.fn()} />); expect(screen.getByRole('img')).toHaveAttribute('src', '/img.jpg'); });
});