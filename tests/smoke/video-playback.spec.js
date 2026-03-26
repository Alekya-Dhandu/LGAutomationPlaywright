const { test, expect } = require('@playwright/test');

test('Video player appears', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'https://telvizappingcom.tv2zdev.com/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('video').first()).toBeVisible({ timeout: 15000 });
});
