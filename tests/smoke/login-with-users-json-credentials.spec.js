const { test, expect } = require('@playwright/test');
const users = require('../../data/test-data/users.json');

function findAppLaunchTargetScreen(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const value = findAppLaunchTargetScreen(item);
      if (value) {
        return value;
      }
    }
    return null;
  }

  if (
    payload.devices &&
    typeof payload.devices === 'object' &&
    payload.devices.app_launch_target_screen
  ) {
    return String(payload.devices.app_launch_target_screen).toLowerCase();
  }

  for (const key of Object.keys(payload)) {
    const value = findAppLaunchTargetScreen(payload[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

async function waitForLaunchTargetFromPlatformSettings(page, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      page.off('response', handleResponse);
      resolve(null);
    }, timeoutMs);

    const handleResponse = async (response) => {
      if (!response.ok()) {
        return;
      }

      const headers = response.headers();
      const contentType = (headers['content-type'] || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        return;
      }

      try {
        const json = await response.json();
        const target = findAppLaunchTargetScreen(json);
        if (!target) {
          return;
        }

        clearTimeout(timeoutId);
        page.off('response', handleResponse);
        resolve({
          target,
          sourceUrl: response.url()
        });
      } catch {
        // Ignore non-JSON payloads and continue scanning API responses.
      }
    };

    page.on('response', handleResponse);
  });
}

test.describe('Smoke Login', () => {
  test('Login With users.json Credentials', async ({ page }) => {
    const { username, password } = users[0];
    const subscriberInput = page.locator('#subscriber-number-input');
    const activationCodeInput = page.locator('#activation-code-input');
    const signInButton = page.locator('#access-code-signIn-redirect');

    // 1. Open the application login page
    await page.goto('/', { waitUntil: 'networkidle' });

    // Required assertion: successful navigation to the login page
    await expect(page).toHaveURL(/https?:\/\/.+/);
    await expect(subscriberInput).toBeVisible();
    await expect(activationCodeInput).toBeVisible();
    await expect(signInButton).toBeVisible();

    // 1. Subscriber number input is visible
    await expect(page.getByText('Subscriber Name')).toBeVisible();

    // 2. Activation code input is visible
    await expect(page.getByText('Activation Code')).toBeVisible();

    // 3. Sign In button is visible before clicking
    await expect(signInButton).toBeVisible();

    // 2. Enter username from data/test-data/users.json into subscriber number input
    await subscriberInput.fill(username);

    // 3. Enter password from data/test-data/users.json into activation code input
    await activationCodeInput.fill(password);

    // 4. Entered username and password values are present in the corresponding fields before submit
    await expect(subscriberInput).toHaveValue(username);
    await expect(activationCodeInput).toHaveValue(password);

    // Capture platform settings API response and app_launch_target_screen after sign in.
    const launchTargetPromise = waitForLaunchTargetFromPlatformSettings(page);

    // 4. Click the Sign In button
    await signInButton.click();

    const launchTargetInfo = await launchTargetPromise;

    // Required assertion: navigate based on platform settings API devices.app_launch_target_screen.
    if (launchTargetInfo && launchTargetInfo.target.includes('live')) {
      await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible();
      await expect(page.getByText('TV Guide').first()).toBeVisible();
      return;
    }

    if (launchTargetInfo && launchTargetInfo.target.includes('home')) {
      await expect(page.getByText('Channels').first()).toBeVisible();
      return;
    }

    // Fallback assertion when API field is unavailable: ensure user still reaches a valid post-login screen.
    try {
      await expect(page.getByText('Channels').first()).toBeVisible({ timeout: 15000 });
    } catch {
      await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible({ timeout: 15000 });
    }
  });
});
