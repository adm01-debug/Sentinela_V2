import { test, expect } from '@playwright/test';

test.describe('Employees CRUD', () => {
  test('should create new employee', async ({ page }) => {
    await page.goto('/employees/new');
    await page.getByLabel(/nome/i).fill('New Employee');
    await page.getByLabel(/email/i).fill('new@company.com');
    await page.getByLabel(/departamento/i).selectOption('TI');
    await page.getByLabel(/cargo/i).fill('Developer');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/funcionário criado/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/employees/new');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/campo obrigatório/i)).toBeVisible();
  });

  test('should edit employee', async ({ page }) => {
    await page.goto('/employees/1/edit');
    await page.getByLabel(/nome/i).fill('Updated Name');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/atualizado com sucesso/i)).toBeVisible();
  });

  test('should delete employee', async ({ page }) => {
    await page.goto('/employees/1');
    await page.getByRole('button', { name: /excluir/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();
    await expect(page.getByText(/excluído com sucesso/i)).toBeVisible();
    await expect(page).toHaveURL(/employees/);
  });

  test('should cancel delete', async ({ page }) => {
    await page.goto('/employees/1');
    await page.getByRole('button', { name: /excluir/i }).click();
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should duplicate employee', async ({ page }) => {
    await page.goto('/employees/1');
    await page.getByRole('button', { name: /duplicar/i }).click();
    await expect(page).toHaveURL(/employees\/new/);
    await expect(page.getByLabel(/nome/i)).toHaveValue(/Copy/);
  });

  test('should bulk delete employees', async ({ page }) => {
    await page.goto('/employees');
    await page.getByRole('checkbox').first().check();
    await page.getByRole('checkbox').nth(1).check();
    await page.getByRole('button', { name: /excluir selecionados/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();
    await expect(page.getByText(/2 funcionários excluídos/i)).toBeVisible();
  });

  test('should import employees', async ({ page }) => {
    await page.goto('/employees/import');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /selecionar arquivo/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('test-data/employees.csv');
    await page.getByRole('button', { name: /importar/i }).click();
    await expect(page.getByText(/importação concluída/i)).toBeVisible();
  });

  test('should export employees', async ({ page }) => {
    await page.goto('/employees');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /exportar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toContain('employees');
  });

  test('should archive employee', async ({ page }) => {
    await page.goto('/employees/1');
    await page.getByRole('button', { name: /arquivar/i }).click();
    await expect(page.getByText(/arquivado/i)).toBeVisible();
  });

  test('should restore archived employee', async ({ page }) => {
    await page.goto('/employees?status=archived');
    await page.getByRole('row').first().getByRole('button', { name: /restaurar/i }).click();
    await expect(page.getByText(/restaurado/i)).toBeVisible();
  });

  test('should validate email uniqueness', async ({ page }) => {
    await page.goto('/employees/new');
    await page.getByLabel(/email/i).fill('existing@company.com');
    await page.getByRole('button', { name: /salvar/i }).click();
    await expect(page.getByText(/email já cadastrado/i)).toBeVisible();
  });
});
