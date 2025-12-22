import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import GeofenceMap from '../GeofenceMap';

describe('GeofenceMap', () => {
  it('renders geofencemap page', () => {
    render(<BrowserRouter><GeofenceMap /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});