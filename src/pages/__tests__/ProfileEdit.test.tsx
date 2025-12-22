import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ProfileEdit from '../ProfileEdit';

describe('ProfileEdit', () => {
  it('renders', () => {
    render(<BrowserRouter><ProfileEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});