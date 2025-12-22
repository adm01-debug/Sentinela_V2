import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Preferences from '../Preferences';

describe('Preferences', () => {
  it('renders', () => {
    render(<BrowserRouter><Preferences /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});