import { Outlet } from 'react-router-dom';

export function FullscreenLayout() {
  return (
    <div className='fixed inset-0 bg-black'>
      <Outlet />
    </div>
  );
}