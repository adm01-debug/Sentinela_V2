import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NotificationSettings from '../NotificationSettings';

describe('NotificationSettings', () => {
  it('renders notificationsettings page', () => {
    render(<BrowserRouter><NotificationSettings /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});