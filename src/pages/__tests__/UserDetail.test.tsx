import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import UserDetail from '../UserDetail';

describe('UserDetail', () => {
  it('renders', () => {
    render(<BrowserRouter><UserDetail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});