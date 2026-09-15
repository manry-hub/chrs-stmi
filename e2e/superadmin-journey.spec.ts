import { test, expect } from "@playwright/test";

test.describe("Superadmin (Kepala CS) Journey", () => {
  // Use the superadmin project so the browser uses e2e/.auth/superadmin.json
  test.setTimeout(120000);
  
  test("creates a new location", async ({ page }) => {
    await page.goto("/superadmin/locations");
    await expect(page).toHaveURL(/\/superadmin\/locations/);
    
    // The add button must be visible on the locations management page
    const addBtn = page.getByRole("button", { name: /tambah/i });
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    
    // Fill in the location name in the modal
    await expect(page.getByLabel(/nama lokasi/i)).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/nama lokasi/i).fill("Gedung D Lantai 1");
    
    // Submit the form
    await page.getByRole("button", { name: /simpan/i }).click();
    
    // Wait for it to appear in the list
    await expect(page.getByText("Gedung D Lantai 1")).toBeVisible({ timeout: 15000 });
  });

  test("creates a new hazard type", async ({ page }) => {
    await page.goto("/superadmin/hazard-types");
    await expect(page).toHaveURL(/\/superadmin\/hazard-types/);
    
    // The add button must be visible on the hazard types management page
    const addBtn = page.getByRole("button", { name: /tambah/i });
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    
    // Fill in the hazard type name in the modal
    await expect(page.getByLabel(/nama kategori/i)).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/nama kategori/i).fill("Atap Bocor");
    
    // Submit the form
    await page.getByRole("button", { name: /simpan/i }).click();
    
    // Wait for it to appear in the list
    await expect(page.getByText("Atap Bocor")).toBeVisible({ timeout: 15000 });
  });
});
