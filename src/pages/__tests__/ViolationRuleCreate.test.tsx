import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ViolationRuleCreate from '../ViolationRuleCreate';

describe('ViolationRuleCreate', () => {
  it('renders', () => {
    render(<BrowserRouter><ViolationRuleCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});