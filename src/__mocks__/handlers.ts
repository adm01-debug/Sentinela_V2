import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: 'mock-token', user: { id: '1', email: 'test@test.com' } });
  }),
  http.get('/api/users/me', () => {
    return HttpResponse.json({ id: '1', email: 'test@test.com', name: 'Test User' });
  }),
  http.get('/api/employees', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
