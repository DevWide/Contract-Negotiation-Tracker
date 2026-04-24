import { test, expect, getStoredContracts, getLocalStorageItem } from '../fixtures/app.fixture';
import { ClausesPage } from '../pages/ClausesPage';

test.describe('Suite 06 — localStorage Persistence', () => {
  let clauses: ClausesPage;

  test.beforeEach(async ({ page }) => {
    clauses = new ClausesPage(page);
  });

  test('TC-42 — Demo contracts are present on fresh load', async ({ page }) => {
    await expect(page.getByText('Demo MSA - Innovatech Solutions').first()).toBeVisible();
  });

  test('TC-43 — User-created clause persists after reload', async ({ page }) => {
    await clauses.addClause({
      clauseNumber: '88.1',
      topic: 'Persistence Validation Topic',
      issueSummary: 'This data must survive a browser reload',
      ourTemplate: 'Original language for persistence check.',
    });

    await clauses.reload();

    await expect(page.getByText('Persistence Validation Topic').first()).toBeVisible();
    await expect(page.getByText('88.1').first()).toBeVisible();
  });

  test('TC-44 — negotiation-tracker-contracts key exists in localStorage', async ({ page }) => {
    const stored = await getLocalStorageItem(page, 'negotiation-tracker-contracts');
    expect(stored).not.toBeNull();
    expect(Array.isArray(stored)).toBe(true);
  });

  test('TC-44b — localStorage contracts have valid structure', async ({ page }) => {
    const stored = await getStoredContracts(page) as Record<string, unknown>[];
    expect(stored.length).toBeGreaterThan(0);
    expect(stored[0]).toHaveProperty('id');
    expect(stored[0]).toHaveProperty('name');
  });

  test('TC-46 — Multiple clauses all persist after reload', async ({ page }) => {
    await clauses.addClause({ topic: 'Persist Clause A', issueSummary: 'Issue A' });
    await clauses.addClause({ topic: 'Persist Clause B', issueSummary: 'Issue B' });
    await clauses.addClause({ topic: 'Persist Clause C', issueSummary: 'Issue C' });

    await clauses.reload();

    await expect(page.getByText('Persist Clause A').first()).toBeVisible();
    await expect(page.getByText('Persist Clause B').first()).toBeVisible();
    await expect(page.getByText('Persist Clause C').first()).toBeVisible();
  });

  test('TC-47 — Ball-in-court state persists after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Switch' }).click();
    await expect(page.getByText('Ball with Them').first()).toBeVisible();

    await clauses.reload();

    await expect(page.getByText('Ball with Them').first()).toBeVisible();
  });
});