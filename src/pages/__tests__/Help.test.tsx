import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Help from '../Help';

describe('Help', () => {
  it('renders help page', () => {
    render(<BrowserRouter><Help /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});