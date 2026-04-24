import { test as base, Page, expect } from '@playwright/test';

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const keys = [
        'negotiation-tracker-contracts',
        'negotiation-tracker-templates',
        'negotiation-tracker-playbook',
        'negotiation-tracker-columns',
        'negotiation-tracker-impact-categories',
      ];
      keys.forEach(key => localStorage.removeItem(key));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Dismiss onboarding modal if present
    const exploreBtn = page.getByRole('button', { name: /explore on my own/i });
    if (await exploreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exploreBtn.click();
      await page.waitForTimeout(300);
    }

    await use(page);
  },
});

export { expect };

export async function getStoredContracts(page: Page): Promise<unknown[]> {
  const raw = await page.evaluate(() =>
    localStorage.getItem('negotiation-tracker-contracts')
  );
  return raw ? JSON.parse(raw) : [];
}

export async function getLocalStorageItem(page: Page, key: string): Promise<unknown> {
  const raw = await page.evaluate((k) => localStorage.getItem(k), key);
  return raw ? JSON.parse(raw) : null;
}