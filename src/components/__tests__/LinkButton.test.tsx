import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkButton } from '../LinkButton';
import { BrowserRouter } from 'react-router-dom';
describe('LinkButton', () => {
  it('renders', () => { render(<BrowserRouter><LinkButton to="/test">Click</LinkButton></BrowserRouter>); expect(screen.getByText('Click')).toBeInTheDocument(); });
});