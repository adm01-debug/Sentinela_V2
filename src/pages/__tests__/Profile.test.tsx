import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Profile from '../Profile';

describe('Profile', () => {
  it('renders', () => {
    render(<BrowserRouter><Profile /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});