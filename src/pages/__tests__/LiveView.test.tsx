import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LiveView from '../LiveView';

describe('LiveView', () => {
  it('renders liveview page', () => {
    render(<BrowserRouter><LiveView /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});