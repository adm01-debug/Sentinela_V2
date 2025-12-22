import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Support from '../Support';

describe('Support', () => {
  it('renders', () => {
    render(<BrowserRouter><Support /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});