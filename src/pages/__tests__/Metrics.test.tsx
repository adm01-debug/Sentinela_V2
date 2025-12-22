import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Metrics from '../Metrics';

describe('Metrics', () => {
  it('renders metrics page', () => {
    render(<BrowserRouter><Metrics /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});