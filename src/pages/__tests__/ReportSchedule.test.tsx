import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ReportSchedule from '../ReportSchedule';

describe('ReportSchedule', () => {
  it('renders', () => {
    render(<BrowserRouter><ReportSchedule /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});