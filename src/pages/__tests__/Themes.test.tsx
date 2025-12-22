import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Themes from '../Themes';

describe('Themes', () => {
  it('renders', () => {
    render(<BrowserRouter><Themes /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});