import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import GeofenceEdit from '../GeofenceEdit';

describe('GeofenceEdit', () => {
  it('renders geofenceedit page', () => {
    render(<BrowserRouter><GeofenceEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});