import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import SecuritySettings from '../SecuritySettings';

describe('SecuritySettings', () => {
  it('renders', () => {
    render(<BrowserRouter><SecuritySettings /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});