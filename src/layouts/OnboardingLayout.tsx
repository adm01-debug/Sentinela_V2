import { Outlet } from 'react-router-dom';

export function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Outlet />
      </div>
    </div>
  );
}
