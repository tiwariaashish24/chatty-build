import { expect, test } from '@playwright/test';

test('authenticate, search, send and reload a direct message on mobile', async ({ page }) => {
  const currentUser = {
    _id: 'user-1',
    fullName: 'Taylor Chat',
    email: 'taylor@example.test',
    profilePic: '',
  };
  const contact = {
    _id: 'user-2',
    fullName: 'Alex Example',
    email: 'alex@example.test',
    profilePic: '',
  };
  let signedIn = false;
  const conversation = [];

  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('**/api/auth/check', (route) =>
    route.fulfill({ json: signedIn ? currentUser : null }),
  );
  await page.route('**/api/auth/login', async (route) => {
    signedIn = true;
    await route.fulfill({ json: currentUser });
  });
  await page.route('**/api/message/users', (route) =>
    route.fulfill({ json: [contact] }),
  );
  await page.route('**/api/message/user-2', (route) =>
    route.fulfill({ json: conversation }),
  );
  await page.route('**/api/message/send/user-2', async (route) => {
    const { text } = route.request().postDataJSON();
    const message = {
      _id: `message-${conversation.length + 1}`,
      senderId: currentUser._id,
      text,
      createdAt: new Date().toISOString(),
    };
    conversation.push(message);
    await route.fulfill({ json: message });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email').fill(currentUser.email);
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL(/\/chat$/);

  await page.getByLabel('Search users').fill('not found');
  await expect(page.getByText('No users match your search.')).toBeVisible();
  await page.getByLabel('Search users').fill('alex');
  await page.getByRole('button', { name: /Alex Example/ }).click();
  await expect(page.getByLabel('Type a message')).toBeVisible();
  await page.getByLabel('Type a message').fill('Hello from mobile');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Hello from mobile')).toBeVisible();

  await page.getByRole('button', { name: 'Show conversations' }).click();
  await page.getByRole('button', { name: /Alex Example/ }).click();
  await expect(page.getByText('Hello from mobile')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Alex Example/ }).click();
  await expect(page.getByText('Hello from mobile')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
