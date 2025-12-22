import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TeamSettings from '../TeamSettings';

describe('TeamSettings', () => {
  it('renders', () => {
    render(<BrowserRouter><TeamSettings /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});