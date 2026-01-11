import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';

vi.mock('@/stores', () => ({ useUIStore: () => ({ toggleSidebar: vi.fn(), openCommandPalette: vi.fn() }), useAuthStore: () => ({ user: { name: 'Test', avatar: null } }), useThemeStore: () => ({ theme: 'light', toggleTheme: vi.fn() }) }));
vi.mock('@/hooks', () => ({ useLogout: () => ({ mutate: vi.fn() }) }));

describe('Header', () => {
  it('renders search button', () => { render(<BrowserRouter><Header /></BrowserRouter>); expect(screen.getByText(/search/i)).toBeInTheDocument(); });
});