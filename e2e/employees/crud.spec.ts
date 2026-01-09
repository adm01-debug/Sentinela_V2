import { test, expect } from '@playwright/test';

test.describe('Employee CRUD', () => {
  test('should open create employee form', async ({ page }) => {
    await page.goto('/employees');
    await page.getByRole('button', { name: /add|novo|create|criar/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    await page.goto('/employees/create');
    await page.getByRole('button', { name: /save|salvar|create|criar/i }).click();
    await expect(page.getByText(/required|obrigatório/i)).toBeVisible();
  });

  test('should create new employee', async ({ page }) => {
    await page.goto('/employees/create');
    await page.getByLabel(/name|nome/i).fill('Test Employee');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /save|salvar/i }).click();
    await expect(page.getByText(/success|sucesso|created|criado/i)).toBeVisible();
  });

  test('should edit existing employee', async ({ page }) => {
    await page.goto('/employees');
    const editButton = page.getByRole('button', { name: /edit|editar/i }).first();
    await editButton.click();
    await page.getByLabel(/name|nome/i).fill('Updated Name');
    await page.getByRole('button', { name: /save|salvar/i }).click();
    await expect(page.getByText(/updated|atualizado/i)).toBeVisible();
  });

  test('should confirm before delete', async ({ page }) => {
    await page.goto('/employees');
    const deleteButton = page.getByRole('button', { name: /delete|excluir/i }).first();
    await deleteButton.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/confirm|confirmar|sure|certeza/i)).toBeVisible();
  });

  test('should delete employee', async ({ page }) => {
    await page.goto('/employees');
    await page.getByRole('button', { name: /delete|excluir/i }).first().click();
    await page.getByRole('button', { name: /confirm|confirmar|yes|sim/i }).click();
    await expect(page.getByText(/deleted|excluído|removed|removido/i)).toBeVisible();
  });

  test('should bulk select employees', async ({ page }) => {
    await page.goto('/employees');
    const selectAll = page.getByRole('checkbox', { name: /select all|selecionar todos/i });
    if (await selectAll.isVisible()) {
      await selectAll.check();
      await expect(page.getByText(/selected|selecionados/i)).toBeVisible();
    }
  });

  test('should export employees list', async ({ page }) => {
    await page.goto('/employees');
    const exportButton = page.getByRole('button', { name: /export|exportar/i });
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      expect(download).toBeDefined();
    }
  });

  test('should import employees', async ({ page }) => {
    await page.goto('/employees/import');
    await expect(page.getByText(/import|importar/i)).toBeVisible();
    await expect(page.getByLabel(/file|arquivo/i)).toBeVisible();
  });
});
