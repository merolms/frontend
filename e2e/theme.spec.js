import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("sidebar is visible with themed background", async ({ page }) => {
    const sidebar = page.locator(".sidebar-wrapper");
    await expect(sidebar).toBeVisible();

    const bg = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor);
    const isDark = bg === "rgb(17, 17, 17)";
    const isLight = bg === "rgb(255, 255, 255)";
    expect(isDark || isLight).toBeTruthy();
  });

  test("navigate to settings page", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Settings" }).first().click();
    await expect(page).toHaveURL("/settings");
  });

  test("theme can be set to light", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("meroedu_theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    });

    await page.reload();
    await page.waitForTimeout(500);

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("light");
  });

  test("sidebar adapts to light theme", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("meroedu_theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    });

    await page.reload();
    await page.waitForTimeout(500);

    const sidebar = page.locator(".sidebar-wrapper");
    const bg = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(255, 255, 255)");
  });

  test("theme can be set to dark", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("meroedu_theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });

    await page.reload();
    await page.waitForTimeout(500);

    const sidebar = page.locator(".sidebar-wrapper");
    const bg = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(17, 17, 17)");
  });

  test("theme preference persists across navigation", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("meroedu_theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });

    await page.locator(".sidebar-item-label").filter({ hasText: "Courses" }).first().click();
    await expect(page).toHaveURL("/courses");

    await page.locator(".sidebar-item-label").filter({ hasText: "Dashboard" }).first().click();
    await expect(page).toHaveURL("/");

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });
});
