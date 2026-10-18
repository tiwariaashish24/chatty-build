import { expect, test } from '@playwright/test';

test('create a room, exchange a persisted message and delete it on mobile', async ({ page }) => {
  const currentUser = {
    _id: 'user-1',
    fullName: 'Taylor Chat',
    email: 'taylor@example.test',
    profilePic: '',
  };
  let signedIn = false;
  let rooms = [];
  const roomMessages = [];

  await page.route('**/socket.io/**', (route) => route.abort());
  await page.route('**/api/auth/check', (route) =>
    route.fulfill({ json: signedIn ? currentUser : null }),
  );
  await page.route('**/api/auth/login', async (route) => {
    signedIn = true;
    await route.fulfill({ json: currentUser });
  });
  await page.route('**/api/room', async (route) => {
    if (route.request().method() === 'POST') {
      const data = route.request().postDataJSON();
      const room = {
        ...data,
        _id: 'room-1',
        createdBy: currentUser._id,
        members: [currentUser._id],
      };
      rooms = [room];
      await route.fulfill({ status: 201, json: room });
      return;
    }
    await route.fulfill({ json: rooms });
  });
  await page.route('**/api/room/room-1', async (route) => {
    if (route.request().method() === 'DELETE') {
      rooms = [];
      await route.fulfill({ json: { message: 'Room deleted' } });
      return;
    }
    await route.fulfill({ json: rooms[0] });
  });
  await page.route('**/api/message/room/room-1', async (route) => {
    if (route.request().method() === 'POST') {
      const { text } = route.request().postDataJSON();
      const message = {
        _id: `room-message-${roomMessages.length + 1}`,
        senderId: currentUser._id,
        text,
        createdAt: new Date().toISOString(),
      };
      roomMessages.push(message);
      await route.fulfill({ json: message });
      return;
    }
    await route.fulfill({ json: roomMessages });
  });
  await page.route('**/api/message/users', (route) =>
    route.fulfill({ json: [] }),
  );

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/rooms');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email').fill(currentUser.email);
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await page.getByRole('button', { name: 'Open rooms' }).click();
  await expect(page).toHaveURL(/\/rooms$/);
  await page.getByRole('button', { name: 'Create Room' }).click();
  await page.getByLabel('Room name').fill('Project Lounge');
  await page.getByLabel(/Description/).fill('Planning and updates');
  await page.getByRole('checkbox', { name: 'Private room' }).check();
  await page.getByRole('button', { name: 'Create Room' }).last().click();
  await expect(page.getByRole('heading', { name: 'Project Lounge' })).toBeVisible();

  await page.getByLabel('Message Project Lounge').fill('Room message survives reload');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Room message survives reload')).toBeVisible();
  await page.getByRole('button', { name: 'Show rooms' }).click();
  await expect(page.getByLabel('Search rooms')).toBeVisible();
  await page.getByLabel('Search rooms').fill('project');
  await page.getByRole('button', { name: /Project Lounge/ }).click();
  await expect(page.getByText('Room message survives reload')).toBeVisible();

  await page.getByRole('button', { name: 'Delete room' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Delete room permanently' }).click();
  await expect(page.getByText('No rooms yet. Create one to get started.')).toBeVisible();
  await page.getByRole('button', { name: 'Open direct messages' }).click();
  await expect(page).toHaveURL(/\/chat$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
