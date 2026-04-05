import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/Header';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations: Record<string, string> = {
        'header.openNavMenu': 'Open navigation menu',
        'header.toggleSidebar': 'Toggle sidebar',
        'header.searchPlaceholder': 'Search...',
        'header.searchLabel': 'Search',
        'header.changeTheme': 'Change theme',
        'header.themeLight': 'Light',
        'header.themeDark': 'Dark',
        'header.themeSystem': 'System',
        'header.notifications': 'Notifications',
        'header.userMenu': 'User menu',
        'header.myProfile': 'My Profile',
        'nav.settings': 'Settings',
        'header.help': 'Help',
        'header.logout': 'Logout',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({ toggleSidebarCollapse: vi.fn() }),
}));

vi.mock('@/providers/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'admin@demo.com', name: 'Admin Demo' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    session: null,
  }),
  default: vi.fn(),
}));

describe('Header Enhanced Features', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Header />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('renders online status indicator', () => {
    render(<Header />);
    expect(screen.getByLabelText('Sistema online')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders notification bell with unread count', () => {
    render(<Header />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    // Should show badge with unread count (2 unread in mock data)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders user avatar with initials', () => {
    render(<Header />);
    expect(screen.getByText('AD')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    expect(screen.getByLabelText('Change theme')).toBeInTheDocument();
  });

  it('calls onMenuClick when mobile menu clicked', async () => {
    const onMenuClick = vi.fn();
    render(<Header onMenuClick={onMenuClick} />);
    // Find the mobile menu button (md:hidden)
    const buttons = screen.getAllByLabelText('Open navigation menu');
    fireEvent.click(buttons[0]);
    expect(onMenuClick).toHaveBeenCalledOnce();
  });

  it('opens notification popover on bell click', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Acesso não autorizado detectado')).toBeInTheDocument();
    expect(screen.getByText('Tentativa de exportação em massa')).toBeInTheDocument();
    expect(screen.getByText('Login fora do horário')).toBeInTheDocument();
  });

  it('shows "Novo" badge on unread notifications', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    const badges = screen.getAllByText('Novo');
    expect(badges.length).toBe(2); // 2 unread notifications
  });

  it('shows severity dots for notifications', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    // Should have severity dots with different colors
    const popover = screen.getByText('Notificações').closest('[data-radix-popper-content-wrapper]') || document.body;
    const dots = popover.querySelectorAll('.rounded-full');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('handles mark all as read', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    const markReadBtn = screen.getByText('Marcar lidas');
    await user.click(markReadBtn);
    // After marking all read, the bell badge should disappear
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('navigates to alerts when notification clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    await user.click(screen.getByText('Acesso não autorizado detectado'));
    expect(mockNavigate).toHaveBeenCalledWith('/alerts');
  });

  it('navigates to alerts from "ver todas" button', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByLabelText('Notifications'));
    await user.click(screen.getByText('Ver todas as notificações'));
    expect(mockNavigate).toHaveBeenCalledWith('/alerts');
  });

  it('handles keyboard shortcut for command palette', () => {
    const onCommandPaletteOpen = vi.fn();
    render(<Header onCommandPaletteOpen={onCommandPaletteOpen} />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onCommandPaletteOpen).toHaveBeenCalledOnce();
  });

  it('handles Ctrl+K shortcut', () => {
    const onCommandPaletteOpen = vi.fn();
    render(<Header onCommandPaletteOpen={onCommandPaletteOpen} />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(onCommandPaletteOpen).toHaveBeenCalledOnce();
  });

  it('does not trigger command palette without modifier key', () => {
    const onCommandPaletteOpen = vi.fn();
    render(<Header onCommandPaletteOpen={onCommandPaletteOpen} />);
    fireEvent.keyDown(document, { key: 'k' });
    expect(onCommandPaletteOpen).not.toHaveBeenCalled();
  });

  it('displays time since last update', () => {
    render(<Header />);
    // Should show time like "0s" or similar
    const statusIndicator = screen.getByLabelText('Sistema online');
    expect(statusIndicator.textContent).toMatch(/\d+[sm]/);
  });

  it('search input is read-only and opens command palette on click', async () => {
    const onCommandPaletteOpen = vi.fn();
    render(<Header onCommandPaletteOpen={onCommandPaletteOpen} />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveAttribute('readOnly');
    fireEvent.click(input);
    expect(onCommandPaletteOpen).toHaveBeenCalledOnce();
  });
});
