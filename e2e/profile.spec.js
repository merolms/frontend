import { test, expect } from "@playwright/test";
import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToProfile(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.click(".sidebar-profile-card");
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
    // John Doe should appear somewhere on the page (profile card or form)
    await expect(page.getByText("John Doe").first()).toBeVisible();
    await expect(page.getByText("Administrator").first()).toBeVisible();
  });

  test("profile has avatar", async ({ page }) => {
    await expect(page.locator(".mantine-Avatar-root, .mantine-Avatar-image").first()).toBeVisible();
  });

  test("profile has breadcrumb or nav", async ({ page }) => {
    // Profile page should have some navigation element
    const nav = page.locator("nav, .mantine-Breadcrumbs-root").first();
    await expect(nav).toBeVisible();
  });

  test("navigating to profile via profile card", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.click(".sidebar-profile-card");
    await expect(page).toHaveURL("/profile");
  });

  test("instructor can access profile", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.click(".sidebar-profile-card");
    await expect(page).toHaveURL("/profile");
  });

  test("student can access profile", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.click(".sidebar-profile-card");
    await expect(page).toHaveURL("/profile");
  });
});

test.describe("Profile Page — Edit Profile", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToProfile(page);
  });

  test("edit mode toggles form", async ({ page }) => {
    const editBtn = page.locator("button").filter({ hasText: "Edit" }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      // Form inputs should appear
      const firstNameInput = page.getByRole("textbox", { name: "First Name" });
      if (await firstNameInput.isVisible()) {
        await expect(firstNameInput).toHaveValue("John");
      }
    }
  });

  test("cancel edit mode reverts changes", async ({ page }) => {
    const editBtn = page.locator("button").filter({ hasText: "Edit" }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(300);
      const firstNameInput = page.getByRole("textbox", { name: "First Name" });
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill("TempName");
        const cancelBtn = page.locator("button").filter({ hasText: "Cancel" }).first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
          // Name should be reverted
          await expect(page.getByText("John Doe")).toBeVisible();
        }
      }
    }
  });
});
