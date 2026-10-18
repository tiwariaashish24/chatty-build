import { expect, test } from '@playwright/test';

test('sign up, reject invalid login, then log in and retain the session', async ({ page }) => {
  const user = {
    _id: 'user-1',
    fullName: 'Taylor Chat',
    email: 'taylor@example.test',
    profilePic: '',
  };
  let signedInUser = null;

  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('**/api/auth/check', (route) =>
    route.fulfill({ json: signedInUser }),
  );
  await page.route('**/api/auth/signup', async (route) => {
    signedInUser = user;
    await route.fulfill({ status: 201, json: user });
  });
  await page.route('**/api/auth/login', async (route) => {
    const { password } = route.request().postDataJSON();
    if (password !== 'correct-password') {
      await route.fulfill({
        status: 401,
        json: { message: 'Invalid Credentials' },
      });
      return;
    }
    signedInUser = user;
    await route.fulfill({ json: user });
  });
  await page.route('**/api/auth/logout', async (route) => {
    signedInUser = null;
    await route.fulfill({ json: { message: 'Logged out successfully' } });
  });
  await page.route('**/api/message/users', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/signup');
  await page.getByLabel('Full Name').fill(user.fullName);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByText('No conversations yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByText('Invalid Credentials')).toBeVisible();

  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await page.reload();
  await expect(page.getByText('No conversations yet.')).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('button', { name: 'Open rooms' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});
