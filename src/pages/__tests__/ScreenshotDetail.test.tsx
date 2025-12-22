import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ScreenshotDetail from '../ScreenshotDetail';

describe('ScreenshotDetail', () => {
  it('renders', () => {
    render(<BrowserRouter><ScreenshotDetail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});