import { http, HttpResponse } from 'msw';

const employees = [
  { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering', role: 'Developer', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Sales', role: 'Manager', status: 'active' },
];

export const handlers = [
  http.get('/api/employees', () => HttpResponse.json({ data: employees, total: employees.length, page: 1, limit: 20, totalPages: 1 })),
  http.get('/api/employees/:id', ({ params }) => { const emp = employees.find(e => e.id === params.id); return emp ? HttpResponse.json(emp) : HttpResponse.json({ message: 'Not found' }, { status: 404 }); }),
  http.post('/api/auth/login', async ({ request }) => { const body = await request.json(); if (body.email === 'admin@test.com') return HttpResponse.json({ token: 'mock-token', user: { id: '1', email: 'admin@test.com', role: 'admin' } }); return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }); }),
  http.get('/api/dashboard/stats', () => HttpResponse.json({ totalEmployees: 150, activeEmployees: 120, averageProductivity: 85, alertsCount: 5, productivityTrend: 5 })),
  http.get('/api/alerts', () => HttpResponse.json({ data: [{ id: '1', type: 'security', severity: 'high', title: 'Test Alert', message: 'Test message', acknowledged: false, createdAt: new Date().toISOString() }], total: 1 })),
];