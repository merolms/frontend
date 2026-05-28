import { test, expect } from '@playwright/test';
import { DEMO_USERS, mockLogin } from './helpers';

async function navigateToSettings(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.locator('.sidebar-item-label').filter({ hasText: 'Settings' }).first().click();
  await expect(page).toHaveURL('/settings');
}

test.describe('Settings Page — Layout & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('settings page loads with sidebar', async ({ page }) => {
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();
    await expect(page).toHaveURL('/settings');
  });

  test('settings page has three tabs', async ({ page }) => {
    await expect(page.locator('[role="tab"]').filter({ hasText: 'Profile' })).toBeVisible();
    await expect(page.locator('[role="tab"]').filter({ hasText: 'Password' })).toBeVisible();
    await expect(page.locator('[role="tab"]').filter({ hasText: 'Appearance' })).toBeVisible();
  });

  test('profile tab is active by default', async ({ page }) => {
    const profileTab = page.locator('[role="tab"]').filter({ hasText: 'Profile' });
    await expect(profileTab).toHaveAttribute('aria-selected', 'true');
  });

  test('breadcrumb shows Profile and Settings', async ({ page }) => {
    // Mantine Breadcrumbs renders as <a> elements with class mantine-Breadcrumbs-breadcrumb
    const breadcrumbProfile = page.locator('.mantine-Breadcrumbs-breadcrumb').filter({ hasText: 'Profile' });
    const breadcrumbSettings = page.locator('.mantine-Breadcrumbs-breadcrumb').filter({ hasText: 'Settings' });
    await expect(breadcrumbProfile).toBeVisible();
    await expect(breadcrumbSettings).toBeVisible();
  });
});

test.describe('Settings Page — Profile Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('profile tab shows user avatar', async ({ page }) => {
    await expect(page.locator('.mantine-Avatar-root')).toBeVisible();
  });

  test('profile tab shows first name input pre-filled', async ({ page }) => {
    const firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toHaveValue('John');
  });

  test('profile tab shows last name input', async ({ page }) => {
    const lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    await expect(lastNameInput).toBeVisible();
    await expect(lastNameInput).toHaveValue('Doe');
  });

  test('profile tab shows email input', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('admin@meroedu.com');
  });

  test('profile tab has Save Changes button', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'Save Changes' }).first()).toBeVisible();
  });

  test('profile form fields are editable', async ({ page }) => {
    const firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    await firstNameInput.fill('UpdatedFirst');
    await expect(firstNameInput).toHaveValue('UpdatedFirst');
  });
});

test.describe('Settings Page — Password Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await page.locator('[role="tab"]').filter({ hasText: 'Password' }).click();
  });

  test('password tab shows current password input', async ({ page }) => {
    const currentPass = page.getByLabel('Current Password');
    await expect(currentPass).toBeVisible();
  });

  test('password tab shows new password input', async ({ page }) => {
    const newPass = page.getByLabel('New Password', { exact: true });
    await expect(newPass).toBeVisible();
  });

  test('password tab shows confirm password input', async ({ page }) => {
    const confirmPass = page.getByLabel('Confirm New Password');
    await expect(confirmPass).toBeVisible();
  });

  test('password tab has Change Password button', async ({ page }) => {
    await expect(page.locator('button').filter({ hasText: 'Change Password' })).toBeVisible();
  });

  test('password fields are editable', async ({ page }) => {
    await page.getByLabel('Current Password').fill('currentPass123');
    await page.getByLabel('New Password', { exact: true }).fill('newPass456');
    await page.getByLabel('Confirm New Password').fill('newPass456');
    await expect(page.getByLabel('Current Password')).toHaveValue('currentPass123');
    await expect(page.getByLabel('New Password', { exact: true })).toHaveValue('newPass456');
  });
});

test.describe('Settings Page — Appearance Tab', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await page.locator('[role="tab"]').filter({ hasText: 'Appearance' }).click();
  });

  test('appearance tab shows theme select', async ({ page }) => {
    // Mantine Select renders as a readonly input with aria-haspopup="listbox"
    const themeSelect = page.locator('.mantine-Select-input');
    await expect(themeSelect).toBeVisible();
  });

  test('appearance tab shows current theme text', async ({ page }) => {
    await expect(page.getByText(/Current:/)).toBeVisible();
  });

  test('theme can be changed to light from appearance tab', async ({ page }) => {
    // Click the Mantine Select input to open the dropdown
    const themeInput = page.locator('.mantine-Select-input');
    await themeInput.click();
    await page.getByRole('option', { name: 'Light' }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('theme can be changed to dark from appearance tab', async ({ page }) => {
    const themeInput = page.locator('.mantine-Select-input');
    await themeInput.click();
    await page.getByRole('option', { name: 'Dark' }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('theme can be changed to system from appearance tab', async ({ page }) => {
    const themeInput = page.locator('.mantine-Select-input');
    await themeInput.click();
    await page.getByRole('option', { name: 'System' }).click();

    // System theme resolves to either light or dark based on OS preference
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).not.toBeNull();
  });
});

test.describe('Settings Page — Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test('switching tabs preserves navigation state', async ({ page }) => {
    await page.locator('[role="tab"]').filter({ hasText: 'Password' }).click();
    await expect(page).toHaveURL('/settings');

    await page.locator('[role="tab"]').filter({ hasText: 'Appearance' }).click();
    await expect(page).toHaveURL('/settings');

    await page.locator('[role="tab"]').filter({ hasText: 'Profile' }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('sidebar remains visible after tab switches', async ({ page }) => {
    await page.locator('[role="tab"]').filter({ hasText: 'Password' }).click();
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();

    await page.locator('[role="tab"]').filter({ hasText: 'Appearance' }).click();
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();
  });
});

test.describe('Settings Page — Access Control', () => {
  test('instructor can access settings page', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.locator('.sidebar-item-label').filter({ hasText: 'Settings' }).first().click();
    await expect(page).toHaveURL('/settings');
  });

  test('student can access settings page', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.locator('.sidebar-item-label').filter({ hasText: 'Settings' }).first().click();
    await expect(page).toHaveURL('/settings');
  });
});
