const { test, expect } = require('@playwright/test');

test('Channel list loads', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'https://telvizappingcom.tv2zdev.com/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-testid="rails-container"]')).toBeVisible({ timeout: 15000 });
});
