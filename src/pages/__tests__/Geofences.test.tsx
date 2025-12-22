import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Geofences from '../Geofences';

describe('Geofences', () => {
  it('renders geofences page', () => {
    render(<BrowserRouter><Geofences /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});