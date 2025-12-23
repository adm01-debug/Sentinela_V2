import { LazyRoutes } from './LazyRoutes';

export const routeConfig = {
  public: [
    { path: '/login', component: LazyRoutes.Login },
    { path: '/register', component: LazyRoutes.Register },
    { path: '/forgot-password', component: LazyRoutes.ForgotPassword },
  ],
  private: [
    { path: '/', component: LazyRoutes.Dashboard },
    { path: '/dashboard', component: LazyRoutes.Dashboard },
    { path: '/employees', component: LazyRoutes.Employees },
    { path: '/teams', component: LazyRoutes.Teams },
    { path: '/activities', component: LazyRoutes.Activities },
    { path: '/screenshots', component: LazyRoutes.Screenshots },
    { path: '/reports', component: LazyRoutes.Reports },
    { path: '/settings', component: LazyRoutes.Settings, role: 'admin' },
    { path: '/profile', component: LazyRoutes.Profile },
  ],
};
