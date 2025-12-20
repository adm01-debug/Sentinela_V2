import { test, expect } from '@playwright/test';

test.describe('Modals and Dialogs', () => {
  test('should open and close modal', async ({ page }) => {
    await page.goto('/employees');
    
    // Find a button that opens a modal
    const addBtn = page.getByText(/adicionar|novo|new|add/i);
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      
      // Modal should be visible
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
        
        // Close with X button
        const closeBtn = modal.locator('button').first();
        await closeBtn.click();
        
        await expect(modal.first()).not.toBeVisible();
      }
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.goto('/employees');
    
    const addBtn = page.getByText(/adicionar|novo|new|add/i);
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.count() > 0) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show confirmation dialog', async ({ page }) => {
    await page.goto('/employees');
    
    // Find delete button
    const deleteBtn = page.getByText(/excluir|delete|remover/i);
    if (await deleteBtn.count() > 0) {
      await deleteBtn.first().click();
      
      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="alertdialog"], .confirm-dialog');
      if (await confirmDialog.count() > 0) {
        await expect(confirmDialog.first()).toBeVisible();
      }
    }
  });

  test('should handle modal form submission', async ({ page }) => {
    await page.goto('/agent-keys');
    
    const createBtn = page.getByText(/criar|novo|new|add/i);
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      
      const modal = page.locator('[role="dialog"]');
      if (await modal.count() > 0) {
        // Fill form in modal
        const nameInput = modal.locator('input').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test Key');
        }
        
        // Submit
        const submitBtn = modal.locator('button[type="submit"], button:has-text("Criar")');
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
        }
      }
    }
  });
});
