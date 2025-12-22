import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Organization from '../Organization';

describe('Organization', () => {
  it('renders', () => {
    render(<BrowserRouter><Organization /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});