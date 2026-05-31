import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Course Preview", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.goto("/courses/1/preview");
    await page.waitForTimeout(3000);
  });

  test("preview page loads without crash", async ({ page }) => {
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
  });

  test("edit button is visible", async ({ page }) => {
    await expect(page.getByText("Edit")).toBeVisible();
  });
});
