import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Calendar from '../Calendar';

describe('Calendar', () => {
  it('renders calendar page', () => {
    render(<BrowserRouter><Calendar /></BrowserRouter>);
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });
});