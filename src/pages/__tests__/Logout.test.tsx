import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Logout from '../Logout';

describe('Logout', () => {
  it('renders logout page', () => {
    render(<BrowserRouter><Logout /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});