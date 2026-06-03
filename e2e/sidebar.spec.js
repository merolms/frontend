import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("sidebar is visible with all nav items", async ({ page }) => {
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();

    const navTitles = ["Dashboard", "Courses", "Categories", "Users", "Teams", "Settings", "Roles"];

    for (const title of navTitles) {
      await expect(page.locator(`.sidebar-wrapper nav a[title="${title}"]`).first()).toBeVisible();
    }
  });

  test("navigating to Courses page via sidebar", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Courses"]').first().click();
    await expect(page).toHaveURL("/courses");
  });

  test("navigating to Users page via sidebar", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Users"]').first().click();
    await expect(page).toHaveURL("/users");
  });

  test("navigating to Teams page via sidebar", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Teams"]').first().click();
    await expect(page).toHaveURL("/teams");
  });

  test("navigating to Settings page via sidebar", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Settings"]').first().click();
    await expect(page).toHaveURL("/settings");
  });

  test("navigating back to Dashboard via sidebar", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Courses"]').first().click();
    await expect(page).toHaveURL("/courses");

    await page.locator('.sidebar-wrapper nav a[title="Dashboard"]').first().click();
    await expect(page).toHaveURL("/");
  });

  test("active dashboard item has active styling on load", async ({ page }) => {
    // Dashboard nav item is active by default
    const dashboardLink = page.locator('.sidebar-wrapper nav a[title="Dashboard"]').first();
    const bg = await dashboardLink.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Active items have a background color (not transparent)
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("active item changes on navigation", async ({ page }) => {
    await page.locator('.sidebar-wrapper nav a[title="Courses"]').first().click();
    await expect(page).toHaveURL("/courses");

    // Courses link should now have active bg (non-transparent)
    const coursesLink = page.locator('.sidebar-wrapper nav a[title="Courses"]').first();
    const coursesBg = await coursesLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    expect(coursesBg).not.toBe("rgba(0, 0, 0, 0)");

    // Dashboard link should NOT have active bg
    const dashboardLink = page.locator('.sidebar-wrapper nav a[title="Dashboard"]').first();
    const dashboardBg = await dashboardLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    expect(dashboardBg).toBe("rgba(0, 0, 0, 0)");
  });

  test("sidebar brand icon is visible", async ({ page }) => {
    await expect(page.locator('.sidebar-wrapper a[title="MeroEdu — Dashboard"]')).toBeVisible();
  });

  test("sidebar has profile button at bottom", async ({ page }) => {
    // The sidebar footer has a button for navigation to profile
    await expect(page.locator(".sidebar-wrapper > div:last-child button").first()).toBeVisible();
  });

  test("clicking profile button navigates to profile", async ({ page }) => {
    await page.locator(".sidebar-wrapper > div:last-child button").first().click();
    await expect(page).toHaveURL("/profile");
  });
});
