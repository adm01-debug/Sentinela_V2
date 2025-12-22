import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Permissions from '../Permissions';

describe('Permissions', () => {
  it('renders', () => {
    render(<BrowserRouter><Permissions /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});