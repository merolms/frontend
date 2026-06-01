import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("dashboard header shows welcome message", async ({ page }) => {
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.locator("h1.page-title").filter({ hasText: "Dashboard" })).toBeVisible();
  });

  test("stats cards are displayed", async ({ page }) => {
    // Wait for stats to load from /stats API
    // Use the stat card labels (inside .text-text-muted.text-xs divs in the stats grid)
    const statsGrid = page.locator(".grid .text-text-muted.text-xs").first().locator("..").locator("..");
    await expect(page.locator(".grid .text-text-muted.text-xs").filter({ hasText: "Total Courses" })).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".grid .text-text-muted.text-xs").filter({ hasText: "Total Users" })).toBeVisible();
    await expect(page.locator(".grid .text-text-muted.text-xs").filter({ hasText: "Total Teams" })).toBeVisible();
    await expect(page.locator(".grid .text-text-muted.text-xs").filter({ hasText: "Categories" })).toBeVisible();
  });

  test("activity feed section is visible", async ({ page }) => {
    await expect(page.getByText("Activity Feed")).toBeVisible();
  });

  test("quick actions section is visible", async ({ page }) => {
    await expect(page.getByText("Quick Actions")).toBeVisible();
  });

  test("summary section is visible", async ({ page }) => {
    await expect(page.getByText("Summary")).toBeVisible({ timeout: 10000 });
  });

  test("upcoming events section is visible", async ({ page }) => {
    await expect(page.getByText("Upcoming Events")).toBeVisible({ timeout: 10000 });
  });

  test("dashboard layout has sidebar and main content", async ({ page }) => {
    await expect(page.locator(".dashboard-layout")).toBeVisible();
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
    await expect(page.locator(".dashboard-main")).toBeVisible();
  });
});
