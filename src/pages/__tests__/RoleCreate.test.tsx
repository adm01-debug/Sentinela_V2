import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RoleCreate from '../RoleCreate';

describe('RoleCreate', () => {
  it('renders', () => {
    render(<BrowserRouter><RoleCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});