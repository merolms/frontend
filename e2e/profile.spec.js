import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToProfile(page) {
  await mockLogin(page, DEMO_USERS.admin);
  // Profile is accessed via the user avatar button in the top bar (DashboardLayout header)
  const avatarBtn = page
    .locator(".dashboard-main button")
    .filter({
      has: page.locator("img, div").filter({ hasText: /[A-Z]/ }),
    })
    .first();
  // Also try the sidebar profile button
  const sidebarProfileBtn = page.locator(".sidebar-wrapper button").first();
  await sidebarProfileBtn.click();
  await expect(page).toHaveURL("/profile");
}

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProfile(page);
  });

  test("profile page loads", async ({ page }) => {
    await expect(page).toHaveURL("/profile");
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
  });

  test("profile shows user info", async ({ page }) => {
    // John Doe should appear somewhere on the page (profile heading)
    await expect(page.getByText("John", { exact: false }).first()).toBeVisible();
  });

  test("profile has avatar", async ({ page }) => {
    // shadcn Avatar component renders img or a fallback div
    await expect(
      page.locator(".sidebar-wrapper img, .sidebar-wrapper .rounded-full").first()
    ).toBeVisible();
  });

  test("profile has settings button", async ({ page }) => {
    await expect(page.getByText("Edit Profile")).toBeVisible();
  });

  test("navigating to profile via profile card", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    const sidebarProfileBtn = page.locator(".sidebar-wrapper button").first();
    await sidebarProfileBtn.click();
    await expect(page).toHaveURL("/profile");
  });

  test("instructor can access profile", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    const sidebarProfileBtn = page.locator(".sidebar-wrapper button").first();
    await sidebarProfileBtn.click();
    await expect(page).toHaveURL("/profile");
  });

  test("student can access profile", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    const sidebarProfileBtn = page.locator(".sidebar-wrapper button").first();
    await sidebarProfileBtn.click();
    await expect(page).toHaveURL("/profile");
  });
});
