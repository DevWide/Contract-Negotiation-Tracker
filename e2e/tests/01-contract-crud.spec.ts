import { test, expect, getStoredContracts } from '../fixtures/app.fixture';
import { ContractsPage } from '../pages/ContractsPage';

test.describe('Suite 01 — Contract CRUD', () => {
  let contracts: ContractsPage;

  test.beforeEach(async ({ page }) => {
    contracts = new ContractsPage(page);
  });

  test('TC-01 — Create a new contract with all required fields', async ({ page }) => {
    await contracts.createContract({
      name: 'Test MSA Agreement',
      counterparty: 'Acme Corp',
      description: 'Master Services Agreement for testing',
    });

    await expect(page.getByText('Test MSA Agreement').first()).toBeVisible();
  });

  test('TC-03 — New contract appears in header dropdown', async ({ page }) => {
    await contracts.createContract({
      name: 'Dropdown Test Contract',
      counterparty: 'Beta Ltd',
    });

    await expect(page.locator('header').getByText('Dropdown Test Contract')).toBeVisible();
  });

  test('TC-06 — Contract persists after page reload', async ({ page }) => {
    await contracts.createContract({
      name: 'Persistent Contract',
      counterparty: 'Persist Inc',
    });

    await contracts.reload();

    // After reload, switch to the created contract to verify it persists
    await contracts.switchToContract('Persistent Contract');
    await expect(page.getByText('Persistent Contract').first()).toBeVisible();
  });

  test('TC-08 — Ball-in-court switch toggles label', async ({ page }) => {
    // Use .first() to avoid strict mode violation — text appears in badge + section
    await expect(page.getByText('Ball with Us').first()).toBeVisible();

    await contracts.switchBallInCourt();

    await expect(page.getByText('Ball with Them').first()).toBeVisible();
  });

  test('TC-08b — Ball-in-court toggle persists after reload', async ({ page }) => {
    await contracts.switchBallInCourt();
    await expect(page.getByText('Ball with Them').first()).toBeVisible();

    await contracts.reload();

    await expect(page.getByText('Ball with Them').first()).toBeVisible();
  });

  test('TC-09 — Switching between contracts loads correct data', async ({ page }) => {
    await contracts.switchToContract('Acme Corp Software License');
    await expect(page.getByText('Acme Corp Software License').first()).toBeVisible();

    await contracts.switchToContract('TechVentures SaaS Agreement');
    await expect(page.getByText('TechVentures SaaS Agreement').first()).toBeVisible();
  });

  test('TC-44 — localStorage key is populated on app load', async ({ page }) => {
    const stored = await getStoredContracts(page);
    expect(Array.isArray(stored)).toBe(true);
    expect((stored as unknown[]).length).toBeGreaterThan(0);
  });
});