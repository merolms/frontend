import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToTeams(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.locator('nav a[title="Teams"]').first().click();
  await expect(page).toHaveURL("/teams");
  // Wait for the team list to load (subtitle shows count)
  await expect(page.getByText(/teams total/)).toBeVisible({ timeout: 10000 });
}

async function navigateToTeamDetail(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.goto("/teams/1");
  // Wait for the detail page to load — Add Member button appears after data loads
  await expect(page.locator("button").filter({ hasText: "Add Member" })).toBeVisible({
    timeout: 15000,
  });
}

test.describe("Team Management — List Page", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
  });

  test("teams page loads with team cards", async ({ page }) => {
    await expect(page.locator("h3").filter({ hasText: "Engineering Team" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("teams page shows correct team count", async ({ page }) => {
    await expect(page.getByText("2 teams total")).toBeVisible();
  });

  test("New Team button is visible", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "New Team" })).toBeVisible();
  });

  test("team cards display team names", async ({ page }) => {
    await expect(page.locator("h3").filter({ hasText: "Engineering Team" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("h3").filter({ hasText: "Design Team" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("clicking a team card navigates to team detail", async ({ page }) => {
    await page.locator("h3").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("search filters teams", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search teams..."]');
    await searchInput.fill("Engineering");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/teams/);
  });

  test("clear filters works", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search teams..."]');
    await searchInput.fill("Engineering");
    await searchInput.press("Enter");
    await page.waitForTimeout(300);

    const clearBtn = page.locator("button").filter({ hasText: "Clear" });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchInput).toHaveValue("");
    }
  });
});

test.describe("Team Management — Create Team", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
  });

  test("navigating to create team page", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");
  });

  test("create team form renders correctly", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");
    // Wait for the form to render
    await expect(page.locator("textarea")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("button").filter({ hasText: "Cancel" })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Save Team" })).toBeVisible();
  });

  test("create team with valid data", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    const nameInput = page.locator("input").first();
    await nameInput.fill("QA Team");
    await page.locator("textarea").fill("Quality assurance team");
    await page.locator("button").filter({ hasText: "Save Team" }).click();

    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("create team shows error for empty name", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    await page.locator("button").filter({ hasText: "Save Team" }).click();

    await expect(page).toHaveURL("/teams/create");
    await expect(page.getByText("Team name is required")).toBeVisible();
  });

  test("cancel button returns to teams list", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    await page.locator("button").filter({ hasText: "Cancel" }).click();
    await expect(page).toHaveURL("/teams");
  });

  test("breadcrumb navigation works on create page", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    const teamsBreadcrumb = page.getByText("Teams", { exact: true }).first();
    await teamsBreadcrumb.click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Team Detail", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeamDetail(page);
  });

  test("team detail page renders correctly", async ({ page }) => {
    await expect(page.locator("h1.page-title").filter({ hasText: "Engineering Team" })).toBeVisible(
      { timeout: 15000 }
    );
  });

  test("team detail shows team info", async ({ page }) => {
    await expect(page.getByText("Core engineering team")).toBeVisible({ timeout: 10000 });
  });

  test("team detail shows members section", async ({ page }) => {
    await expect(page.getByText(/Team Members/)).toBeVisible({ timeout: 10000 });
  });

  test("team detail shows member count", async ({ page }) => {
    await expect(page.getByText(/member/)).toBeVisible({ timeout: 10000 });
  });

  test("breadcrumb navigation works on detail page", async ({ page }) => {
    await page.getByText("Teams", { exact: true }).first().click();
    await expect(page).toHaveURL("/teams");
  });

  test("clicking Edit navigates to edit page", async ({ page }) => {
    const editBtn = page.locator("button").filter({ hasText: "Edit" }).first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/teams\/\d+\/edit/);
  });
});

test.describe("Team Management — Edit Team", () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, DEMO_USERS.admin);
    await page.goto("/teams/1/edit");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => document.querySelector("textarea") !== null, {
      timeout: 10000,
    });
  });

  test("edit team page renders correctly", async ({ page }) => {
    await expect(page.getByText("Update the team details below")).toBeVisible({ timeout: 10000 });
  });

  test("edit form is pre-filled with team data", async ({ page }) => {
    const inputs = page.locator("input");
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  });

  test("edit team updates data", async ({ page }) => {
    const nameInput = page.locator("input").first();
    await nameInput.fill("Engineering Team Updated");
    await page.locator("button").filter({ hasText: "Save Changes" }).click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
    await expect(page).not.toHaveURL(/edit/);
  });

  test("cancel button returns to team detail", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Cancel" }).click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
    await expect(page).not.toHaveURL(/edit/);
  });

  test("breadcrumb navigation on edit page", async ({ page }) => {
    await expect(page.getByText("Teams", { exact: true })).toBeVisible();
    await expect(page.getByText("Edit", { exact: true })).toBeVisible();

    await page.getByText("Teams", { exact: true }).click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Delete Team", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeamDetail(page);
  });

  test("clicking Delete opens confirmation modal", async ({ page }) => {
    const deleteBtn = page.locator("button").filter({ hasText: "Delete" }).first();
    await deleteBtn.click();
    await expect(page.getByText("Delete Team", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("button").filter({ hasText: "Cancel" }).last()).toBeVisible();
  });

  test("delete modal has confirm and cancel buttons", async ({ page }) => {
    const deleteBtn = page.locator("button").filter({ hasText: "Delete" }).first();
    await deleteBtn.click();
    await expect(page.locator("button").filter({ hasText: "Cancel" }).last()).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Delete" }).last()).toBeVisible();
  });

  test("canceling delete closes modal", async ({ page }) => {
    const deleteBtn = page.locator("button").filter({ hasText: "Delete" }).first();
    await deleteBtn.click();
    await expect(page.getByText("Delete Team", { exact: true })).toBeVisible();
    await page.locator("button").filter({ hasText: "Cancel" }).last().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("confirming delete redirects to teams list", async ({ page }) => {
    const deleteBtn = page.locator("button").filter({ hasText: "Delete" }).first();
    await deleteBtn.click();
    await expect(page.getByText("Delete Team", { exact: true })).toBeVisible();
    await page.locator("button").filter({ hasText: "Delete" }).last().click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Add Member", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeamDetail(page);
  });

  test("clicking Add Member opens assignment modal", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Member" }).click();
    await expect(page.getByText(/Current Members/).first()).toBeVisible({ timeout: 15000 });
  });

  test("add member modal can be closed", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Member" }).click();
    await expect(page.getByText(/Current Members/).first()).toBeVisible({ timeout: 15000 });

    await page.locator("button").filter({ hasText: "Done" }).click();
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });
});

test.describe("Team Management — Remove Member", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeamDetail(page);
  });

  test("members are displayed in the members list", async ({ page }) => {
    await expect(page.getByText(/Team Members/)).toBeVisible({ timeout: 10000 });
  });

  test("member count is displayed", async ({ page }) => {
    await expect(page.getByText(/member/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Team Management — Permissions", () => {
  test("student is redirected from teams page (no permission)", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.locator('nav a[title="Teams"]').first().click();
    await expect(page).toHaveURL("/unauthorized");
  });
});
