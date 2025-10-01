import { test, expect } from '@playwright/test';

test('homepage has title and generate button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('MEGAMIND ULTRA')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate Variants' })).toBeVisible();
});
