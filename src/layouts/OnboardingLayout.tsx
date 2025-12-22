import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary to-primary-dark'>
      <div className='container mx-auto py-12'>
        <Outlet />
      </div>
    </div>
  );
}