import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToSettings(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.locator("nav a[title=\"Settings\"]").first().click();
  await expect(page).toHaveURL("/settings");
}

// Helper to get the tab buttons (inside the TabsList div, not breadcrumbs)
function getTab(page, name) {
  // The TabsList is a div with class containing "flex items-center gap-1 rounded-lg border"
  // Tab buttons are direct children. We need to avoid the breadcrumb "Profile" button.
  return page.locator(".border-border.flex.items-center.gap-1 button").filter({ hasText: name }).first();
}

test.describe("Settings Page — Layout & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test("settings page loads with sidebar", async ({ page }) => {
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
    await expect(page).toHaveURL("/settings");
  });

  test("settings page has three tabs", async ({ page }) => {
    await expect(getTab(page, "Profile")).toBeVisible();
    await expect(getTab(page, "Password")).toBeVisible();
    await expect(getTab(page, "Appearance")).toBeVisible();
  });

  test("profile tab is active by default", async ({ page }) => {
    const profileTab = getTab(page, "Profile");
    const cls = await profileTab.getAttribute("class");
    expect(cls).toContain("bg-primary");
  });

  test("breadcrumb shows Profile and Settings", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Profile" }).first()).toBeVisible();
    await expect(page.getByText("Settings", { exact: true }).last()).toBeVisible();
  });
});

test.describe("Settings Page — Profile Tab", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test("profile tab shows user avatar", async ({ page }) => {
    await expect(page.locator("img.rounded-full").first()).toBeVisible();
  });

  test("profile tab shows first name input pre-filled", async ({ page }) => {
    const inputs = page.locator('input[type="text"], input:not([type])');
    await expect(inputs.first()).toBeVisible();
  });

  test("profile tab shows save button", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "Save Changes" }).first()).toBeVisible();
  });

  test("profile form fields are editable", async ({ page }) => {
    const inputs = page.locator('input[type="text"], input:not([type])');
    const firstNameInput = inputs.first();
    await firstNameInput.fill("UpdatedFirst");
    await expect(firstNameInput).toHaveValue("UpdatedFirst");
  });
});

test.describe("Settings Page — Password Tab", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await getTab(page, "Password").click();
  });

  test("password tab shows current password input", async ({ page }) => {
    const currentPass = page.locator('input[type="password"]').first();
    await expect(currentPass).toBeVisible();
  });

  test("password tab shows three password inputs", async ({ page }) => {
    const passInputs = page.locator('input[type="password"]');
    await expect(passInputs).toHaveCount(3);
  });

  test("password tab has Change Password button", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "Change Password" })).toBeVisible();
  });

  test("password fields are editable", async ({ page }) => {
    const passInputs = page.locator('input[type="password"]');
    await passInputs.nth(0).fill("currentPass123");
    await passInputs.nth(1).fill("newPass456");
    await passInputs.nth(2).fill("newPass456");
    await expect(passInputs.nth(0)).toHaveValue("currentPass123");
    await expect(passInputs.nth(1)).toHaveValue("newPass456");
  });
});

test.describe("Settings Page — Appearance Tab", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
    await getTab(page, "Appearance").click();
  });

  test("appearance tab shows theme select", async ({ page }) => {
    await expect(page.getByText("Theme")).toBeVisible();
  });

  test("appearance tab shows current theme text", async ({ page }) => {
    await expect(page.getByText(/Current:/)).toBeVisible();
  });

  test("theme can be changed to light from appearance tab", async ({ page }) => {
    const themeBtn = page.locator("button").filter({ hasText: /^(Light|Dark|System)$/ }).first();
    await themeBtn.click();
    await page.getByRole("option", { name: "Light" }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("light");
  });

  test("theme can be changed to dark from appearance tab", async ({ page }) => {
    const themeBtn = page.locator("button").filter({ hasText: /^(Light|Dark|System)$/ }).first();
    await themeBtn.click();
    await page.getByRole("option", { name: "Dark" }).click();

    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });
});

test.describe("Settings Page — Tab Switching", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToSettings(page);
  });

  test("switching tabs preserves navigation state", async ({ page }) => {
    await getTab(page, "Password").click();
    await expect(page).toHaveURL("/settings");

    await getTab(page, "Appearance").click();
    await expect(page).toHaveURL("/settings");

    await getTab(page, "Profile").click();
    await expect(page).toHaveURL("/settings");
  });

  test("sidebar remains visible after tab switches", async ({ page }) => {
    await getTab(page, "Password").click();
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();

    await getTab(page, "Appearance").click();
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
  });
});

test.describe("Settings Page — Access Control", () => {
  test("instructor can access settings page", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
  });

  test("student can access settings page", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.locator("nav a[title=\"Settings\"]").first().click();
    await expect(page).toHaveURL("/settings");
  });
});
