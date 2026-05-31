import { test, expect } from "@playwright/test";
import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Course Builder", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.goto("/courses/1/builder");
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
  });

  test("builder page loads without crash", async ({ page }) => {
    await expect(page).toHaveURL(/\/courses\/1\/builder/);
    // Page should not have crashed — either sidebar or main content visible
    const sidebar = page.locator(".sidebar-wrapper");
    await expect(sidebar).toBeVisible();
  });

  test("sidebar shows course-related nav items", async ({ page }) => {
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
    await expect(page.getByText("Courses")).toBeVisible();
  });

  test("URL includes course id", async ({ page }) => {
    await expect(page).toHaveURL(/\/courses\/1\/builder/);
  });
});
