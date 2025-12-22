import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import SSOCallback from '../SSOCallback';

describe('SSOCallback', () => {
  it('renders', () => {
    render(<BrowserRouter><SSOCallback /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});