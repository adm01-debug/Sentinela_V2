import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import GeofenceCreate from '../GeofenceCreate';

describe('GeofenceCreate', () => {
  it('renders geofencecreate page', () => {
    render(<BrowserRouter><GeofenceCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});