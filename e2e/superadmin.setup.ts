import fs from "node:fs/promises";
import { test as setup, expect } from "@playwright/test";

setup("authenticate superadmin once", async ({ page }) => {
  setup.setTimeout(120000);
  const email = "testsuperadmin@hazardreport.test";
  const password = "TestUser@123";

  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("login-submit")).toBeEnabled({ timeout: 60000 });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByTestId("login-submit").click();

  await expect(page).not.toHaveURL(/\/login\?.*(email|password)=/);
  await expect(page).not.toHaveURL(/\/login/, { timeout: 60000 });

  await fs.mkdir("e2e/.auth", { recursive: true });
  await page.context().storageState({ path: "e2e/.auth/superadmin.json" });
});
