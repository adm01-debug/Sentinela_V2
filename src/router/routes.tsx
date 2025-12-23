import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Employees = lazy(() => import('@/pages/Employees'));
const Teams = lazy(() => import('@/pages/Teams'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const routes: RouteObject[] = [
  { path: '/', element: <PrivateRoute><MainLayout /></PrivateRoute>, children: [
    { index: true, element: <Dashboard /> },
    { path: 'employees', element: <Employees /> },
    { path: 'teams', element: <Teams /> },
    { path: 'reports', element: <Reports /> },
    { path: 'settings', element: <Settings /> },
  ]},
  { path: '/auth', element: <PublicRoute><AuthLayout /></PublicRoute>, children: [
    { path: 'login', element: <Login /> },
    { path: 'register', element: <Register /> },
  ]},
  { path: '*', element: <NotFound /> },
];
