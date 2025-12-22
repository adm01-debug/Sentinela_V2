import { Outlet } from 'react-router-dom';

export function PrintLayout() {
  return (
    <div className="print:p-0 p-8 bg-white min-h-screen">
      <Outlet />
    </div>
  );
}
