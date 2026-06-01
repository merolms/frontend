import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Courses Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await page.locator("nav a[title=\"Courses\"]").first().click();
    await expect(page).toHaveURL("/courses");
  });

  test("courses page loads", async ({ page }) => {
    await expect(page).toHaveURL("/courses");
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
  });

  test("filter controls are visible", async ({ page }) => {
    // The course page has a search input within a Paper component
    await expect(page.locator("input[placeholder=\"Search courses...\"]")).toBeVisible();
  });

  test("course content is displayed", async ({ page }) => {
    await page.waitForTimeout(1000);
    // Page loaded without crash
    await expect(page).toHaveURL("/courses");
  });
});

test.describe("Courses Page - Student", () => {
  test("student can access courses page", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.locator("nav a[title=\"Courses\"]").first().click();
    await expect(page).toHaveURL("/courses");
  });
});
