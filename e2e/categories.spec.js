import { expect, test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

async function navigateToCategories(page) {
  await mockLogin(page, DEMO_USERS.admin);
  await page.waitForTimeout(1000);
  await page.goto("/admin/categories");
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL("/admin/categories");
  // Wait for the category list to load
  await expect(page.getByText(/categories total/)).toBeVisible({ timeout: 15000 });
}

test.describe("Categories Page — List", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("categories page loads with table", async ({ page }) => {
    await expect(page).toHaveURL("/categories");
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("categories page shows correct total count", async ({ page }) => {
    await expect(page.getByText("3 categories total")).toBeVisible();
  });

  test("seed categories are displayed", async ({ page }) => {
    await expect(page.getByText("Programming")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Design")).toBeVisible();
    await expect(page.getByText("Data Science")).toBeVisible();
  });

  test("category row shows description", async ({ page }) => {
    await expect(page.getByText("Software development courses")).toBeVisible();
    await expect(page.getByText("UI/UX and graphic design")).toBeVisible();
  });

  test("category row shows status badge", async ({ page }) => {
    // All seed categories are active
    const activeBadges = page.locator("td").filter({ hasText: "Active" });
    await expect(activeBadges).toHaveCount(3, { timeout: 10000 });
  });

  test("category row shows course count", async ({ page }) => {
    await expect(page.locator("td").filter({ hasText: "5" }).first()).toBeVisible();
  });

  test("New Category button is visible", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "New Category" })).toBeVisible();
  });

  test("filter controls are visible", async ({ page }) => {
    await expect(page.locator('input[placeholder="Search categories..."]')).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Clear" })).toBeVisible();
  });
});

test.describe("Categories Page — Search & Filter", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("search filters categories by name", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search categories..."]');
    await searchInput.fill("Programming");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    await expect(page.getByText("Programming")).toBeVisible();
    // Design and Data Science should not be visible
    await expect(page.getByText("Design")).not.toBeVisible();
    await expect(page.getByText("Data Science")).not.toBeVisible();
  });

  test("search filters categories by description", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search categories..."]');
    await searchInput.fill("machine learning");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    await expect(page.getByText("Data Science")).toBeVisible();
    await expect(page.getByText("Programming")).not.toBeVisible();
  });

  test("clear filters resets search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search categories..."]');
    await searchInput.fill("Programming");
    await searchInput.press("Enter");
    await page.waitForTimeout(300);

    const clearBtn = page.locator("button").filter({ hasText: "Clear" });
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");
    // All categories should be visible again
    await expect(page.getByText("Programming")).toBeVisible();
    await expect(page.getByText("Design")).toBeVisible();
    await expect(page.getByText("Data Science")).toBeVisible();
  });

  test("sort by name A-Z", async ({ page }) => {
    const sortSelect = page.locator("button").filter({ hasText: "Sort" }).first();
    // The sort trigger is inside a Select component
    const sortTrigger = page.locator("div").filter({ hasText: /^Sort$/ }).first();
    if (await sortTrigger.isVisible()) {
      await sortTrigger.click();
      await page.getByText("Name A-Z").click();
      await page.waitForTimeout(500);
      // Data Science should come before Design alphabetically
      const rows = page.locator("tbody tr");
      await expect(rows.first()).toContainText("Data Science");
    }
  });
});

test.describe("Categories Page — Create", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("clicking New Category opens create form", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });
  });

  test("create form has all required fields", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });

    // Name and slug fields
    const dialog = page.locator("[role='dialog']");
    await expect(dialog.locator("input").first()).toBeVisible();
    await expect(dialog.locator("input").nth(1)).toBeVisible();
    // Description textarea
    await expect(dialog.locator("textarea")).toBeVisible();
    // Color and icon selects
    await expect(dialog.locator("button").filter({ hasText: "Cancel" })).toBeVisible();
    await expect(dialog.locator("button").filter({ hasText: "Create Category" })).toBeVisible();
  });

  test("create category with valid data", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("input").first().fill("QA Testing");
    await dialog.locator("textarea").fill("Quality assurance and testing courses");
    await dialog.locator("button").filter({ hasText: "Create Category" }).click();

    // Should close dialog and show new category in list
    await expect(page.getByText("QA Testing").first()).toBeVisible({ timeout: 10000 });
  });

  test("create category shows error for empty name", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("button").filter({ hasText: "Create Category" }).click();

    // Should show validation error
    await expect(page.getByText("Category name is required")).toBeVisible();
    // Dialog should still be open
    await expect(page.getByText("Create Category")).toBeVisible();
  });

  test("cancel button closes create form", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("button").filter({ hasText: "Cancel" }).click();

    // Dialog should close
    await expect(page.getByText("Create Category")).not.toBeVisible();
    // Should still be on categories page
    await expect(page).toHaveURL("/categories");
  });

  test("slug is auto-generated from name", async ({ page }) => {
    await page.locator("button").filter({ hasText: "New Category" }).click();
    await expect(page.getByText("Create Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("input").first().fill("Web Development");

    // Slug should be auto-generated
    const slugInput = dialog.locator("input").nth(1);
    await expect(slugInput).toHaveValue("web-development");
  });
});

test.describe("Categories Page — Edit", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("clicking edit button opens edit form", async ({ page }) => {
    // Find the edit button in the Programming row
    const row = page.locator("tr").filter({ hasText: "Programming" });
    const editBtn = row.locator("button").filter({ hasText: "" }).first(); // Pencil icon button
    // The edit button is the first button in the actions cell
    const actionsCell = row.locator("td").last();
    const buttons = actionsCell.locator("button");
    await buttons.first().click();

    await expect(page.getByText("Edit Category")).toBeVisible({ timeout: 10000 });
  });

  test("edit form is pre-filled with category data", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Programming" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").first().click();

    await expect(page.getByText("Edit Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await expect(dialog.locator("input").first()).toHaveValue("Programming");
  });

  test("edit category updates data", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Programming" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").first().click();

    await expect(page.getByText("Edit Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("input").first().fill("Programming Updated");
    await dialog.locator("button").filter({ hasText: "Save Changes" }).click();

    // Should show updated name
    await expect(page.getByText("Programming Updated").first()).toBeVisible({ timeout: 10000 });
  });

  test("cancel button closes edit form", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Design" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").first().click();

    await expect(page.getByText("Edit Category")).toBeVisible({ timeout: 10000 });

    const dialog = page.locator("[role='dialog']");
    await dialog.locator("button").filter({ hasText: "Cancel" }).click();

    await expect(page.getByText("Edit Category")).not.toBeVisible();
    await expect(page).toHaveURL("/categories");
  });
});

test.describe("Categories Page — Delete", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("clicking delete opens confirmation modal", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Data Science" });
    const actionsCell = row.locator("td").last();
    // Delete button is the last button (Trash2 icon)
    await actionsCell.locator("button").last().click();

    await expect(page.getByText("Delete Category", { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test("delete modal has confirm and cancel buttons", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Data Science" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").last().click();

    await expect(page.getByText("Delete Category", { exact: true })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Cancel" }).last()).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "Delete" }).last()).toBeVisible();
  });

  test("canceling delete closes modal", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Data Science" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").last().click();

    await expect(page.getByText("Delete Category", { exact: true })).toBeVisible();
    await page.locator("button").filter({ hasText: "Cancel" }).last().click();

    // Category should still be visible
    await expect(page.getByText("Data Science")).toBeVisible();
    await expect(page).toHaveURL("/categories");
  });

  test("confirming delete removes category", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Data Science" });
    const actionsCell = row.locator("td").last();
    await actionsCell.locator("button").last().click();

    await expect(page.getByText("Delete Category", { exact: true })).toBeVisible();
    await page.locator("button").filter({ hasText: "Delete" }).last().click();

    // Data Science should be removed from the list
    await page.waitForTimeout(500);
    await expect(page.getByText("Data Science")).not.toBeVisible();
    // Total count should decrease
    await expect(page.getByText("2 categories total")).toBeVisible();
  });
});

test.describe("Categories Page — Toggle Status", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCategories(page);
  });

  test("toggle status button is visible", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Programming" });
    const actionsCell = row.locator("td").last();
    // Toggle button is the middle button (ToggleLeft icon)
    const buttons = actionsCell.locator("button");
    await expect(buttons).toHaveCount(3); // Edit, Toggle, Delete
  });

  test("toggling status changes badge", async ({ page }) => {
    const row = page.locator("tr").filter({ hasText: "Programming" });
    const actionsCell = row.locator("td").last();
    const buttons = actionsCell.locator("button");

    // Initially Active
    await expect(row.locator("td").filter({ hasText: "Active" })).toBeVisible();

    // Click toggle (second button)
    await buttons.nth(1).click();
    await page.waitForTimeout(500);

    // Should now show Inactive
    await expect(row.locator("td").filter({ hasText: "Inactive" })).toBeVisible();
  });
});

test.describe("Categories Page — Permissions", () => {
  test("student cannot access categories page", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.student);
    await page.goto("/admin/categories");
    await page.waitForTimeout(500);
    // Student doesn't have category.create permission, should be redirected
    await expect(page).toHaveURL("/unauthorized");
  });

  test("instructor cannot access categories page", async ({ page }) => {
    await mockLogin(page, DEMO_USERS.instructor);
    await page.goto("/admin/categories");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/unauthorized");
  });
});

test.describe("Categories Page — Empty State", () => {
  test("empty state shows when no categories match search", async ({ page }) => {
    await navigateToCategories(page);

    const searchInput = page.locator('input[placeholder="Search categories..."]');
    await searchInput.fill("zzzznonexistent");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);

    await expect(page.getByText("No categories found")).toBeVisible();
  });
});
