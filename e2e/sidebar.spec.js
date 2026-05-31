import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("sidebar is visible with all nav items", async ({ page }) => {
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();

    const navLabels = [
      "Dashboard",
      "Courses",
      "Categories",
      "Users",
      "Teams",
      "Learning",
      "Settings",
      "Roles",
    ];

    for (const label of navLabels) {
      await expect(
        page.locator(".sidebar-item-label").filter({ hasText: label }).first()
      ).toBeVisible();
    }
  });

  test("navigating to Courses page via sidebar", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Courses" }).first().click();
    await expect(page).toHaveURL("/courses");
  });

  test("navigating to Users page via sidebar", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Users" }).first().click();
    await expect(page).toHaveURL("/users");
  });

  test("navigating to Teams page via sidebar", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Teams" }).first().click();
    await expect(page).toHaveURL("/teams");
  });

  test("navigating to Profile page via profile card", async ({ page }) => {
    await page.click(".sidebar-profile-card");
    await expect(page).toHaveURL("/profile");
  });

  test("navigating to Settings page via sidebar", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Settings" }).first().click();
    await expect(page).toHaveURL("/settings");
  });

  test("navigating back to Dashboard via sidebar", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Courses" }).first().click();
    await expect(page).toHaveURL("/courses");

    await page.locator(".sidebar-item-label").filter({ hasText: "Dashboard" }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("active item gets selected styling", async ({ page }) => {
    await expect(page.locator(".sidebar-item-icon.selected").first()).toBeVisible();
  });

  test("active item changes on navigation", async ({ page }) => {
    await page.locator(".sidebar-item-label").filter({ hasText: "Courses" }).first().click();
    await expect(page).toHaveURL("/courses");

    // Courses icon should have selected class
    const coursesItem = page
      .locator(".sidebar-item")
      .filter({
        has: page.locator(".sidebar-item-label").filter({ hasText: "Courses" }),
      })
      .first();
    await expect(coursesItem.locator(".sidebar-item-icon")).toHaveClass(/selected/);

    // Dashboard icon should NOT have selected class
    const dashboardItem = page
      .locator(".sidebar-item")
      .filter({
        has: page.locator(".sidebar-item-label").filter({ hasText: "Dashboard" }),
      })
      .first();
    await expect(dashboardItem.locator(".sidebar-item-icon")).not.toHaveClass(/selected/);
  });

  test("sidebar brand icon is visible", async ({ page }) => {
    await expect(page.locator(".sidebar-brand .brand-icon")).toBeVisible();
  });

  test("sidebar footer has profile card", async ({ page }) => {
    await expect(page.locator(".sidebar-profile-card")).toBeVisible();
  });

  test("clicking profile card navigates to profile", async ({ page }) => {
    await page.click(".sidebar-profile-card");
    await expect(page).toHaveURL("/profile");
  });
});
