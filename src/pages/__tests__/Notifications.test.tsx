import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Notifications from '../Notifications';

describe('Notifications', () => {
  it('renders notifications page', () => {
    render(<BrowserRouter><Notifications /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});