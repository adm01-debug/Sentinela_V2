import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RoleEdit from '../RoleEdit';

describe('RoleEdit', () => {
  it('renders', () => {
    render(<BrowserRouter><RoleEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});