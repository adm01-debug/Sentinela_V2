import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ReportExport from '../ReportExport';

describe('ReportExport', () => {
  it('renders', () => {
    render(<BrowserRouter><ReportExport /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});