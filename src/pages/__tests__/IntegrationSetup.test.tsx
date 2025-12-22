import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import IntegrationSetup from '../IntegrationSetup';

describe('IntegrationSetup', () => {
  it('renders integrationsetup page', () => {
    render(<BrowserRouter><IntegrationSetup /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});