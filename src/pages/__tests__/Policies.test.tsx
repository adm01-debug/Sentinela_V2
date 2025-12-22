import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Policies from '../Policies';

describe('Policies', () => {
  it('renders', () => {
    render(<BrowserRouter><Policies /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});