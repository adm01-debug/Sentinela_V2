import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownPreview } from '../MarkdownPreview';
describe('MarkdownPreview', () => {
  it('renders', () => { render(<MarkdownPreview content="**Bold**" />); expect(screen.getByText('Bold')).toBeInTheDocument(); });
  it('renders links', () => { render(<MarkdownPreview content="[Link](https://test.com)" />); expect(screen.getByRole('link')).toHaveAttribute('href', 'https://test.com'); });
});