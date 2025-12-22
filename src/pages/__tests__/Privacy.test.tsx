import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Privacy from '../Privacy';

describe('Privacy', () => {
  it('renders', () => {
    render(<BrowserRouter><Privacy /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});