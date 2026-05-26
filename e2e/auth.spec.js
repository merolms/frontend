import { test, expect } from '@playwright/test';
import { DEMO_USERS, mockLogin, mockLogout } from './helpers';

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'MeroEdu' })).toBeVisible();
    await expect(page.getByText('Learning Management System')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByText('Demo Accounts')).toBeVisible();
  });

  test('demo account quick-fill works', async ({ page }) => {
    await page.goto('/login');
    await page.click('.auth-demo-item:has(.auth-demo-role.admin)');
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@meroedu.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('admin123');
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL('/');
    // Sidebar should be visible (layout rendered)
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();
    // Dashboard page title (h1.page-title)
    await expect(page.locator('h1.page-title').filter({ hasText: 'Dashboard' })).toBeVisible();
  });

  test('login with instructor account', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await expect(page).toHaveURL('/');
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();
  });

  test('login with student account', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await expect(page).toHaveURL('/');
    await expect(page.locator('.sidebar-wrapper')).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL('/');
    await mockLogout(page);
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.auth-page')).toBeVisible();
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('forgot password link works', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL('/forgot-password');
  });

  test('empty form does not submit', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');
  });
});
