import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Course Preview", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await page.goto("/courses/1/preview");
    await page.waitForTimeout(3000);
  });

  test("preview page loads without crash", async ({ page }) => {
    // CoursePreview uses its own layout with SideBar directly (not DashboardLayout)
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
  });

  test("edit button is visible", async ({ page }) => {
    // The Edit button in CoursePreview has text "Edit"
    await expect(page.getByText("Edit")).toBeVisible();
  });
});
