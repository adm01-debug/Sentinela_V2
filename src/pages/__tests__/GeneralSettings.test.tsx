import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import GeneralSettings from '../GeneralSettings';

describe('GeneralSettings', () => {
  it('renders generalsettings page', () => {
    render(<BrowserRouter><GeneralSettings /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});