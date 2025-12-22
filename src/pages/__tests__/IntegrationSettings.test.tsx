import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import IntegrationSettings from '../IntegrationSettings';

describe('IntegrationSettings', () => {
  it('renders integrationsettings page', () => {
    render(<BrowserRouter><IntegrationSettings /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});