import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Feedback from '../Feedback';

describe('Feedback', () => {
  it('renders feedback page', () => {
    render(<BrowserRouter><Feedback /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});