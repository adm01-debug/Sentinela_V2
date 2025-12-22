import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import UserEdit from '../UserEdit';

describe('UserEdit', () => {
  it('renders', () => {
    render(<BrowserRouter><UserEdit /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});