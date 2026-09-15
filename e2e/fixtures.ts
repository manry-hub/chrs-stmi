import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: async ({ page }, use) => {
    await expect(page).not.toHaveURL(/\/login/);
    // Playwright's fixture callback is intentionally named `use`; React's hook rule is unrelated here.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use();
  },
});

export { expect };
