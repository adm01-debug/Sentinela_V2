import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ActivityDetail from '../ActivityDetail';

describe('ActivityDetail', () => {
  it('renders activity detail page', () => {
    render(<BrowserRouter><ActivityDetail /></BrowserRouter>);
    expect(screen.getByText(/activity/i)).toBeInTheDocument();
  });
});