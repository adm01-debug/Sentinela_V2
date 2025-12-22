import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login', () => HttpResponse.json({ token: 'mock-token', user: { id: '1', name: 'Test', email: 'test@test.com' } })),
  http.get('/api/users', () => HttpResponse.json({ data: [], total: 0 })),
  http.get('/api/employees', () => HttpResponse.json({ data: [], total: 0 })),
];