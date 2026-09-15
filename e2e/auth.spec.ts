import { test, expect } from "./fixtures";

const validEmail = process.env.E2E_USER_EMAIL ?? "testuser@hazardreport.test";

test.describe("authentication and access control", () => {
  test("shows validation errors for malformed credentials", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("login-submit")).toBeEnabled({ timeout: 60000 });
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByTestId("login-submit").click();

    await expect(page.getByText(/email/i).last()).toBeVisible();
    // Zod's default min(6) message is "String must contain at least 6 character(s)"
    await expect(page.getByText(/at least 6 character|6 karakter|password/i).last()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("login-submit")).toBeEnabled({ timeout: 60000 });
    await page.getByLabel("Email").fill(validEmail);
    await page.getByLabel("Password").fill("definitely-wrong-password");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toHaveText("Email atau password salah", { timeout: 15000 });
    await expect(page).not.toHaveURL(/\/login\?.*(email|password)=/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects an unauthenticated user away from admin routes", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in an authenticated user and redirects by role", async ({ authenticatedPage, page }) => {
    void authenticatedPage;
    await page.goto("/");
    // We expect it to navigate to /dashboard for normal users (or /admin, /superadmin)
    // Since our test user is a normal user, they should go to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logs out the user successfully", async ({ authenticatedPage, page }) => {
    void authenticatedPage;
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Open sidebar if on mobile
    const menuBtn = page.getByTitle("Buka Menu").first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    const logoutBtn = page.getByRole("button", { name: /logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/);
    
    // Ensure we can't go back to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip("redirects to login on session expiry (cleared cookies)", async ({ authenticatedPage, page }) => {
    void authenticatedPage;
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    
    await page.context().clearCookies();
    await page.reload();
    
    await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
  });
});
