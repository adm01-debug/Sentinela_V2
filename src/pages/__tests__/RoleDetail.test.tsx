import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RoleDetail from '../RoleDetail';

describe('RoleDetail', () => {
  it('renders', () => {
    render(<BrowserRouter><RoleDetail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});