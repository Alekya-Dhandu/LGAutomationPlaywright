const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

test('Login with credentials from LoginPage', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'https://telvizappingcom.tv2zdev.com/';
  const loginPage = new LoginPage(page);

  const response = await loginPage.open(baseUrl);

  expect(response && response.ok()).toBeTruthy();
  await expect(page).toHaveURL(/https?:\/\//);
  await expect(loginPage.body()).toBeVisible();
  await expect(loginPage.subscriberInput()).toBeVisible();
  await expect(loginPage.activationCodeInput()).toBeVisible();
  await expect(loginPage.signInButton()).toBeVisible();
  await expect(loginPage.firstInteractiveElement()).toBeVisible();

  const credentials = loginPage.getCredentials();
  expect(credentials.username).toBeTruthy();
  expect(credentials.password).toBeTruthy();

  await loginPage.enterCredentials(credentials);
  await expect(loginPage.subscriberInput()).toHaveValue(credentials.username);
  await expect(loginPage.activationCodeInput()).toHaveValue(credentials.password);

  await loginPage.submitLogin();

  const channelsText = page.getByText('Channels');
  const tvGuideText = page.getByText('TV Guide');

  try {
    await expect(channelsText).toBeVisible({ timeout: 15000 });
  } catch {
    await expect(tvGuideText).toBeVisible({ timeout: 15000 });
  }
});
