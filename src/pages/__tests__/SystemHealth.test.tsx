import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import SystemHealth from '../SystemHealth';

describe('SystemHealth', () => {
  it('renders', () => {
    render(<BrowserRouter><SystemHealth /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});