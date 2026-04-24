import { test, expect } from '../fixtures/app.fixture';
import { ClausesPage } from '../pages/ClausesPage';

test.describe('Suite 02 — Clause Management', () => {
  let clauses: ClausesPage;

  test.beforeEach(async ({ page }) => {
    clauses = new ClausesPage(page);
  });

  test('TC-10 — Add clause with all three text fields', async ({ page }) => {
    await clauses.addClause({
      clauseNumber: '99.1',
      topic: 'Test Liability',
      ourTemplate: 'Liability shall be limited to the annual contract value.',
      theirMarkup: 'Liability shall be limited to $10,000.',
      ourResponse: 'Liability shall be limited to $50,000.',
      issueSummary: 'Liability cap negotiation',
    });

    await expect(page.getByText('Test Liability').first()).toBeVisible();
    await expect(page.getByText('99.1').first()).toBeVisible();
  });

  test('TC-12 — Clause appears in table after creation', async ({ page }) => {
    const initialCount = await clauses.getClauseCount();

    await clauses.addClause({
      clauseNumber: '99.2',
      topic: 'Payment Terms Test',
      issueSummary: 'Net payment days test',
    });

    const newCount = await clauses.getClauseCount();
    expect(newCount).toBe(initialCount + 1);
    await expect(page.getByText('Payment Terms Test').first()).toBeVisible();
  });

  test('TC-16 — Clause persists after page reload', async ({ page }) => {
    await clauses.addClause({
      clauseNumber: '99.3',
      topic: 'Persistence Test Clause',
      issueSummary: 'This clause must survive a reload',
      ourTemplate: 'Original language for persistence test.',
    });

    await clauses.reload();

    await expect(page.getByText('Persistence Test Clause').first()).toBeVisible();
    await expect(page.getByText('99.3').first()).toBeVisible();
  });

  test('TC-18 — Ctrl+N opens Add New Clause form', async ({ page }) => {
    await clauses.pressCtrlN();
    await page.waitForTimeout(400);
    await expect(page.getByText('Add New Clause').first()).toBeVisible();
  });

  test('TC-19 — Search filters clause table', async ({ page }) => {
    await clauses.addClause({
      topic: 'Indemnification',
      issueSummary: 'Unique Indemnification Clause scope',
    });

    await clauses.searchClauses('Unique Indemnification Clause');

    await expect(page.getByText('Unique Indemnification Clause scope').first()).toBeVisible();
    await expect(page.getByText('Payment Terms', { exact: true })).not.toBeVisible();
  });

  test('TC-19b — Clearing search restores full clause list', async ({ page }) => {
    await clauses.searchClauses('xyznonexistent');
    await clauses.clearSearch();
    await expect(page.getByText('Payment Terms', { exact: true }).first()).toBeVisible();
  });

  test('TC-17 — Form closes after successful clause creation', async ({ page }) => {
    await clauses.addClause({
      topic: 'Form Close Test',
      issueSummary: 'Verify form closes after save',
    });

    await expect(page.getByText('Form Close Test').first()).toBeVisible();
  });
});