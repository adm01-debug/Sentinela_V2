import { Outlet } from 'react-router-dom';

export function PrintLayout() {
  return (
    <div className='print:m-0 print:p-0'>
      <Outlet />
    </div>
  );
}