import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Users from '../Users';

describe('Users', () => {
  it('renders', () => {
    render(<BrowserRouter><Users /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});