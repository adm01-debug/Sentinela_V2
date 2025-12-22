import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Onboarding from '../Onboarding';

describe('Onboarding', () => {
  it('renders onboarding page', () => {
    render(<BrowserRouter><Onboarding /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});