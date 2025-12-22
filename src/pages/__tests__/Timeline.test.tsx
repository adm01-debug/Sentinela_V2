import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Timeline from '../Timeline';

describe('Timeline', () => {
  it('renders', () => {
    render(<BrowserRouter><Timeline /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});