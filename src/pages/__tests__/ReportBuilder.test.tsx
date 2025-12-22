import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ReportBuilder from '../ReportBuilder';

describe('ReportBuilder', () => {
  it('renders', () => {
    render(<BrowserRouter><ReportBuilder /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});