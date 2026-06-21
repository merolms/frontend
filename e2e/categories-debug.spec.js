import { test } from "@playwright/test";

import { DEMO_USERS, mockLogin } from "./helpers";

test("debug JS errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("CONSOLE: " + msg.text());
  });

  await mockLogin(page, DEMO_USERS.admin);
  await page.waitForTimeout(5000);

  const rootContent = await page.innerHTML("#root");
  throw new Error(
    "ERRORS: " + JSON.stringify(errors, null, 2) + "\nROOT: " + rootContent.substring(0, 1000)
  );
});
