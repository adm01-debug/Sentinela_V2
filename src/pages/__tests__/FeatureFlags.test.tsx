import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import FeatureFlags from '../FeatureFlags';

describe('FeatureFlags', () => {
  it('renders feature flags page', () => {
    render(<BrowserRouter><FeatureFlags /></BrowserRouter>);
    expect(screen.getByText(/feature/i)).toBeInTheDocument();
  });
});