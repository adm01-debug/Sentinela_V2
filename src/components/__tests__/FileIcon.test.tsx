import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileIcon } from '../FileIcon';
describe('FileIcon', () => {
  it('renders PDF icon', () => { render(<FileIcon type="pdf" />); expect(screen.getByTestId('icon-pdf')).toBeInTheDocument(); });
  it('renders image icon', () => { render(<FileIcon type="image" />); expect(screen.getByTestId('icon-image')).toBeInTheDocument(); });
  it('renders default icon', () => { render(<FileIcon type="unknown" />); expect(screen.getByTestId('icon-file')).toBeInTheDocument(); });
});