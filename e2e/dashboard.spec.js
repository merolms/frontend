import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await expect(page).toHaveURL("/");
  });

  test("dashboard header shows welcome message", async ({ page }) => {
    await expect(page.getByText("Welcome back, John")).toBeVisible();
    await expect(page.locator("h1.page-title").filter({ hasText: "Dashboard" })).toBeVisible();
  });

  test("stats row displays stat cards", async ({ page }) => {
    await expect(page.locator(".stats-row")).toBeVisible();
    await expect(page.getByText("Total Courses")).toBeVisible();
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Total Teams")).toBeVisible();
    await expect(page.getByText("Avg. Completion")).toBeVisible();
  });

  test("recent courses section is visible", async ({ page }) => {
    await expect(page.getByText("Recent Courses")).toBeVisible();
  });

  test("activity feed section is visible", async ({ page }) => {
    await expect(page.getByText("Activity Feed")).toBeVisible();
  });

  test("quick actions section is visible", async ({ page }) => {
    await expect(page.getByText("Quick Actions")).toBeVisible();
  });

  test("team performance section is visible", async ({ page }) => {
    await expect(page.getByText("Team Performance")).toBeVisible();
  });

  test("enrollment summary section is visible", async ({ page }) => {
    await expect(page.getByText("Enrollment Summary")).toBeVisible();
  });

  test("dashboard layout has sidebar and main content", async ({ page }) => {
    await expect(page.locator(".dashboard-layout")).toBeVisible();
    await expect(page.locator(".sidebar-wrapper")).toBeVisible();
    await expect(page.locator(".dashboard-main")).toBeVisible();
  });
});
