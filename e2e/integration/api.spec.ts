import { test, expect } from '@playwright/test';

test('API health check', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.ok()).toBeTruthy();
});