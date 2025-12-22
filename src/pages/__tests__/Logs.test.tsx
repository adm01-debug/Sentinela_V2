import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Logs from '../Logs';

describe('Logs', () => {
  it('renders logs page', () => {
    render(<BrowserRouter><Logs /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});