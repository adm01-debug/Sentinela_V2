import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Roles from '../Roles';

describe('Roles', () => {
  it('renders', () => {
    render(<BrowserRouter><Roles /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});