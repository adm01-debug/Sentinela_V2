import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PolicyEdit from '../PolicyEdit';

describe('PolicyEdit', () => {
  it('renders', () => {
    render(<BrowserRouter><PolicyEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});