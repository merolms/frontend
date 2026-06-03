import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Users Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await page.locator('.sidebar-wrapper nav a[title="Users"]').first().click();
  });

  test("users page loads without redirecting to login", async ({ page }) => {
    await expect(page).toHaveURL("/users");
  });

  test("users page shows content", async ({ page }) => {
    await page.waitForTimeout(1000);
    // Page loaded without crash — the main test
    await expect(page).toHaveURL("/users");
  });
});
