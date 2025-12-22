import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Screenshots from '../Screenshots';

describe('Screenshots', () => {
  it('renders', () => {
    render(<BrowserRouter><Screenshots /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});