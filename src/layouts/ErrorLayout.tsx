import { Outlet } from 'react-router-dom';

export function ErrorLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Outlet />
      </div>
    </div>
  );
}
