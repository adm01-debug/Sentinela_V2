import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ViolationDetail from '../ViolationDetail';

describe('ViolationDetail', () => {
  it('renders', () => {
    render(<BrowserRouter><ViolationDetail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});