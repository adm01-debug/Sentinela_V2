import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TeamDetail from '../TeamDetail';

describe('TeamDetail', () => {
  it('renders', () => {
    render(<BrowserRouter><TeamDetail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});