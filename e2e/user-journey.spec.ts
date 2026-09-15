import { test, expect } from "./fixtures";
import path from "path";

test.describe("User (Civitas Akademika) Journey", () => {
  test.setTimeout(120000);

  test("creates a new hazard report successfully", async ({ authenticatedPage, page }) => {
    void authenticatedPage;
    
    // Go to the dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForLoadState("networkidle");
    // Wait for React hydration by checking that the form's combobox input is interactive
    await expect(page.getByPlaceholder(/ketik atau pilih jenis bahaya/i)).toBeVisible({ timeout: 15000 });
    
    // Fill out the form
    const iconPath = path.resolve(__dirname, "../src/app/icon.png");
    // Often there's no label for input[type=file], maybe it's just the input itself
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
       await fileInput.setInputFiles(iconPath);
    }
    
    // Fill out hazard type (Combobox)
    const hazardInput = page.getByPlaceholder(/ketik atau pilih jenis bahaya/i);
    await expect(hazardInput).toBeVisible();
    await hazardInput.fill("Kabel Terkelupas");
    const hazOption = page.getByRole("option", { name: /Kabel Terkelupas/i }).first();
    await expect(hazOption).toBeVisible({ timeout: 10000 });
    await hazOption.click();
    
    // Fill out additional info
    await page.getByLabel(/informasi tambahan/i).fill("Ada genangan air akibat atap bocor, sangat berbahaya karena banyak yang lewat.");
    
    // Fill out location.
    const locationInput = page.getByPlaceholder(/pilih lokasi/i).or(page.getByRole("combobox", { name: /lokasi/i }));
    await expect(locationInput).toBeVisible();
    await locationInput.fill("Toilet Lantai 2 Gedung C");
    const locOption = page.getByRole("option", { name: /Toilet Lantai 2 Gedung C/i }).first();
    await expect(locOption).toBeVisible({ timeout: 10000 });
    await locOption.click();
    
    // Submit the report
    await page.getByRole("button", { name: /kirim laporan/i }).click();
    
    // Wait for redirect to /dashboard/reports or the report page
    await page.waitForURL(/\/reports\/.*/, { timeout: 45000 });
    
    // Verify the report exists in the list (or it redirects to /reports/[id], so wait for /reports)
    await expect(page).toHaveURL(/.*\/reports/);
  });
});
