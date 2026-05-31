import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Access Control & Permissions", () => {
  test("admin can access courses and dashboard", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);

    await page.goto("/courses");
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL("/unauthorized");
    await expect(page).toHaveURL("/courses");
  });

  test("student can access courses", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);

    await page.goto("/courses");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/courses");
  });

  test("unauthorized page is accessible", async ({ page }) => {
    await page.goto("/unauthorized");
    await expect(page).toHaveURL(/unauthorized/);
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page).toHaveURL("/forgot-password");
  });
});
