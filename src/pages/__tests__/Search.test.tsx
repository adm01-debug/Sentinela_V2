import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Search from '../Search';

describe('Search', () => {
  it('renders', () => {
    render(<BrowserRouter><Search /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});