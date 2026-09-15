import { test, expect } from "@playwright/test";

test.describe("Admin (Cleaning Service) Journey", () => {
  // Use the admin project so the browser uses e2e/.auth/admin.json
  test.setTimeout(120000);
  
  test("views pending reports and updates status", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(page).toHaveURL(/\/admin\/reports/);
    
    // Wait for the table/list to load
    await page.waitForLoadState("networkidle");
    
    const reportTitle = "Kabel Terkelupas";
    
    // The report MUST exist because user-journey creates it (enforced by project dependency).
    // Use assertive expect instead of conditional check.
    const reportLocator = page.locator(`text=${reportTitle}`).first();
    await expect(reportLocator).toBeVisible({ timeout: 30000 });
    
    // Find and click the detail/process link for this report
    const detailBtn = page.getByRole("link", { name: /detail|proses/i }).first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();
    
    // Wait for detail page to load
    await page.waitForLoadState("networkidle");
    
    // Click the confirm button — it must be visible since the report is pending
    const confirmBtn = page.getByRole("button", { name: /Konfirmasi Laporan/i });
    await expect(confirmBtn).toBeVisible({ timeout: 10000 });
    await confirmBtn.click();
    
    // Wait for success toast (react-hot-toast renders text in the DOM)
    await expect(page.getByText(/Laporan berhasil dikonfirmasi/i)).toBeVisible({ timeout: 10000 });
  });
});
