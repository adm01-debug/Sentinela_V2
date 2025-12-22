import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TeamCreate from '../TeamCreate';

describe('TeamCreate', () => {
  it('renders', () => {
    render(<BrowserRouter><TeamCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});