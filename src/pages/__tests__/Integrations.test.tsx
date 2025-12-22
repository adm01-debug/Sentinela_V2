import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Integrations from '../Integrations';

describe('Integrations', () => {
  it('renders integrations page', () => {
    render(<BrowserRouter><Integrations /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});