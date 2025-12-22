import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Overview from '../Overview';

describe('Overview', () => {
  it('renders', () => {
    render(<BrowserRouter><Overview /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});