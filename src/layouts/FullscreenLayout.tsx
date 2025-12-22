import { Outlet } from 'react-router-dom';

export function FullscreenLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <Outlet />
    </div>
  );
}
