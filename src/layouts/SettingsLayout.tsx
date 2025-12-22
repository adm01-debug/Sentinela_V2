import { Outlet, NavLink } from 'react-router-dom';

const settingsNav = [
  { to: '/settings/general', label: 'Geral' },
  { to: '/settings/security', label: 'Segurança' },
  { to: '/settings/notifications', label: 'Notificações' },
  { to: '/settings/integrations', label: 'Integrações' },
];

export function SettingsLayout() {
  return (
    <div className="flex gap-8">
      <nav className="w-64 space-y-1">
        {settingsNav.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `block px-4 py-2 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`
          }>{label}</NavLink>
        ))}
      </nav>
      <div className="flex-1"><Outlet /></div>
    </div>
  );
}
