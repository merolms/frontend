import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("sidebar is visible", async ({ page }) => {
    const sidebar = page.locator(".sidebar-wrapper");
    await expect(sidebar).toBeVisible();
  });

  test("navigate to settings page", async ({ page }) => {
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
  });

  test("theme can be set to light via settings appearance tab", async ({ page }) => {
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
    await page.locator("button").filter({ hasText: "Appearance" }).first().click();

    const themeBtn = page.locator("button").filter({ hasText: /^(Light|Dark|System)$/ }).first();
    await themeBtn.click();
    await page.getByRole("option", { name: "Light" }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("light");
  });

  test("theme can be set to dark via settings appearance tab", async ({ page }) => {
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
    await page.locator("button").filter({ hasText: "Appearance" }).first().click();

    const themeBtn = page.locator("button").filter({ hasText: /^(Light|Dark|System)$/ }).first();
    await themeBtn.click();
    await page.getByRole("option", { name: "Dark" }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });

  test("theme preference persists across navigation", async ({ page }) => {
    // Set theme to dark via settings
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
    await page.locator("button").filter({ hasText: "Appearance" }).first().click();

    const themeBtn = page.locator("button").filter({ hasText: /^(Light|Dark|System)$/ }).first();
    await themeBtn.click();
    await page.getByRole("option", { name: "Dark" }).click();

    // Navigate away and back
    await page.locator("nav a[title=\"Courses\"]").first().click();
    await expect(page).toHaveURL("/courses");

    await page.locator("nav a[title=\"Dashboard\"]").first().click();
    await expect(page).toHaveURL("/");

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });
});
