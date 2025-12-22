import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Maintenance from '../Maintenance';

describe('Maintenance', () => {
  it('renders maintenance page', () => {
    render(<BrowserRouter><Maintenance /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});