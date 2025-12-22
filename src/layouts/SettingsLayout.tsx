import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/settings/general', label: 'General' },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/notifications', label: 'Notifications' },
  { to: '/settings/billing', label: 'Billing' },
];

export function SettingsLayout() {
  return (
    <div className='flex gap-6'>
      <nav className='w-48 space-y-1'>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>{item.label}</NavLink>
        ))}
      </nav>
      <div className='flex-1'><Outlet /></div>
    </div>
  );
}