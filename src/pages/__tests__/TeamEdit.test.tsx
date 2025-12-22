import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TeamEdit from '../TeamEdit';

describe('TeamEdit', () => {
  it('renders', () => {
    render(<BrowserRouter><TeamEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});