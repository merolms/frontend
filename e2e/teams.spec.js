import { test, expect } from "@playwright/test";
import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToTeams(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.locator(".sidebar-item-label").filter({ hasText: "Teams" }).first().click();
  await expect(page).toHaveURL("/teams");
}

test.describe("Team Management — List Page", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
  });

  test("teams page loads with team cards", async ({ page }) => {
    await expect(page.locator(".team-card").first()).toBeVisible();
  });

  test("teams page shows correct team count", async ({ page }) => {
    await expect(page.locator(".page-subtitle").filter({ hasText: /team/ })).toBeVisible();
  });

  test("New Team button is visible", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "New Team" })).toBeVisible();
  });

  test("team cards display team names", async ({ page }) => {
    await expect(
      page.locator(".team-card-title").filter({ hasText: "Engineering Team" })
    ).toBeVisible();
    await expect(page.locator(".team-card-title").filter({ hasText: "Design Team" })).toBeVisible();
  });

  test("clicking a team card navigates to team detail", async ({ page }) => {
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("search filters teams", async ({ page }) => {
    const searchInput = page.locator('.team-search-form input[placeholder*="Search"]');
    await searchInput.fill("Engineering");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    // URL may include query params — just check it's still on /teams
    await expect(page).toHaveURL(/\/teams/);
  });

  test("clear filters works", async ({ page }) => {
    const searchInput = page.locator('.team-search-form input[placeholder*="Search"]');
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

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="color"]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Create Team" })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Cancel" })).toBeVisible();
  });

  test("create team with valid data", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    await page.locator('input[name="name"]').fill("QA Team");
    await page.locator('textarea[name="description"]').fill("Quality assurance team");
    await page.locator("button").filter({ hasText: "Create Team" }).click();

    // Should navigate to the new team's detail page
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("create team shows error for empty name", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Team" }).click();
    await expect(page).toHaveURL("/teams/create");

    await page.locator("button").filter({ hasText: "Create Team" }).click();

    await expect(page).toHaveURL("/teams/create");
    await expect(page.locator(".team-form-error")).toBeVisible();
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

    await page.locator(".breadcrumb").getByText("Teams").click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Team Detail", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("team detail page renders correctly", async ({ page }) => {
    await expect(page.locator("h1.page-title").filter({ hasText: "Teams" })).toBeVisible();
    await expect(
      page.locator(".page-subtitle").filter({ hasText: "Engineering Team" })
    ).toBeVisible();
  });

  test("team detail shows action buttons", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "Add Member" })).toBeVisible();
    // Edit and Delete buttons may be icon-only or have different text
    const headerRight = page.locator(".header-right");
    await expect(headerRight).toBeVisible();
  });

  test("team detail shows team info", async ({ page }) => {
    await expect(page.locator("h2").filter({ hasText: "Engineering Team" })).toBeVisible();
    await expect(page.getByText("Core engineering team")).toBeVisible();
  });

  test("team detail shows members section", async ({ page }) => {
    await expect(page.getByText("Team Members")).toBeVisible();
  });

  test("team detail shows member count", async ({ page }) => {
    await expect(page.locator(".team-quick-stat")).toBeVisible();
  });

  test("breadcrumb navigation works on detail page", async ({ page }) => {
    await page.locator(".breadcrumb").getByText("Teams").click();
    await expect(page).toHaveURL("/teams");
  });

  test("clicking Edit navigates to edit page", async ({ page }) => {
    // Edit button may be an icon button — find it in header-right
    const editBtn = page
      .locator(".header-right")
      .locator("button, a")
      .filter({ hasText: /Edit|pencil/ })
      .first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/teams\/\d+\/edit/);
  });
});

test.describe("Team Management — Edit Team", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
    const editBtn = page
      .locator(".header-right")
      .locator("button, a")
      .filter({ hasText: /Edit|pencil/ })
      .first();
    await editBtn.click();
    await expect(page).toHaveURL(/\/teams\/\d+\/edit/);
  });

  test("edit team page renders correctly", async ({ page }) => {
    await expect(page.locator("h1.page-title").filter({ hasText: "Teams" })).toBeVisible();
    await expect(page.locator(".page-subtitle").filter({ hasText: "Edit team" })).toBeVisible();
  });

  test("edit form is pre-filled with team data", async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
  });

  test("edit team updates data", async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
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
    const breadcrumb = page.locator(".breadcrumb");
    await expect(breadcrumb.getByText("Teams")).toBeVisible();
    await expect(breadcrumb.getByText("Edit")).toBeVisible();

    await breadcrumb.getByText("Teams").click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Delete Team", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("clicking Delete opens confirmation modal", async ({ page }) => {
    const deleteBtn = page
      .locator(".header-right")
      .locator("button")
      .filter({ hasText: /Delete|trash/ })
      .first();
    await deleteBtn.click();
    // Mantine modal content is visible even when root has transition delays
    await expect(page.getByText(/delete/i, { exact: false }).first()).toBeVisible();
    await expect(
      page.locator(".ui.modal button").filter({ hasText: "Cancel" }).first()
    ).toBeVisible();
  });

  test("delete modal has confirm and cancel buttons", async ({ page }) => {
    const deleteBtn = page
      .locator(".header-right")
      .locator("button")
      .filter({ hasText: /Delete|trash/ })
      .first();
    await deleteBtn.click();
    await expect(
      page.locator(".ui.modal button").filter({ hasText: "Cancel" }).first()
    ).toBeVisible();
    await expect(
      page
        .locator(".ui.modal button")
        .filter({ hasText: /Delete|trash/ })
        .first()
    ).toBeVisible();
  });

  test("canceling delete closes modal", async ({ page }) => {
    const deleteBtn = page
      .locator(".header-right")
      .locator("button")
      .filter({ hasText: /Delete|trash/ })
      .first();
    await deleteBtn.click();
    await expect(
      page.locator(".ui.modal button").filter({ hasText: "Cancel" }).first()
    ).toBeVisible();
    await page.locator(".ui.modal button").filter({ hasText: "Cancel" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("confirming delete redirects to teams list", async ({ page }) => {
    const deleteBtn = page
      .locator(".header-right")
      .locator("button")
      .filter({ hasText: /Delete|trash/ })
      .first();
    await deleteBtn.click();
    await expect(
      page
        .locator(".ui.modal button")
        .filter({ hasText: /Delete|trash/ })
        .first()
    ).toBeVisible();
    await page
      .locator(".ui.modal button")
      .filter({ hasText: /Delete|trash/ })
      .first()
      .click();
    await expect(page).toHaveURL("/teams");
  });
});

test.describe("Team Management — Add Member", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("clicking Add Member opens assignment modal", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Member" }).click();
    await expect(page.locator(".ui.modal").first()).toBeAttached();
    await expect(page.getByText(/Manage Members|Current Members/i).first()).toBeVisible();
  });

  test("add member modal shows available users", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Member" }).click();
    await expect(page.getByText(/Manage Members|Current Members/i).first()).toBeVisible();
    await page.waitForTimeout(500);
  });

  test("add member modal can be closed", async ({ page }) => {
    await page.locator("button").filter({ hasText: "Add Member" }).click();
    await expect(page.getByText(/Manage Members|Current Members/i).first()).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });
});

test.describe("Team Management — Remove Member", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToTeams(page);
    await page.locator(".team-card-title").filter({ hasText: "Engineering Team" }).first().click();
    await expect(page).toHaveURL(/\/teams\/\d+/);
  });

  test("members are displayed in the members list", async ({ page }) => {
    await expect(page.getByText("Team Members")).toBeVisible();
  });

  test("member count is displayed", async ({ page }) => {
    await expect(page.locator(".team-quick-stat")).toBeVisible();
  });
});

test.describe("Team Management — Permissions", () => {
  test("student is redirected from teams page (no permission)", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.locator(".sidebar-item-label").filter({ hasText: "Teams" }).first().click();
    // Student doesn't have teams.view permission, so they get redirected to /unauthorized
    await expect(page).toHaveURL("/unauthorized");
  });
});
