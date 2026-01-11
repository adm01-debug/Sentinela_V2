import { chromium, FullConfig } from '@playwright/test';
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  await page.getByLabel('Email').fill('admin@sentinela.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.context().storageState({ path: './e2e/.auth/admin.json' });
  await browser.close();
}
export default globalSetup;