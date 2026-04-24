import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ClauseData {
  clauseNumber?: string;
  topic?: string;
  issueSummary?: string;
  ourTemplate?: string;
  theirMarkup?: string;
  ourResponse?: string;
  ourRationale?: string;
  status?: 'No Changes' | 'In Discussion' | 'Agreed' | 'Escalated' | 'Blocked';
  priority?: 'High' | 'Medium' | 'Low';
}

export class ClausesPage extends BasePage {
  readonly addClauseButton: Locator;
  readonly clauseTableRows: Locator;
  readonly searchInput: Locator;
  readonly clauseNumberInput: Locator;
  readonly topicInput: Locator;
  readonly ourTemplateTextarea: Locator;
  readonly theirMarkupTextarea: Locator;
  readonly ourResponseTextarea: Locator;
  readonly issueSummaryTextarea: Locator;
  readonly ourRationaleTextarea: Locator;
  readonly cancelClauseButton: Locator;

  constructor(page: Page) {
    super(page);

    this.addClauseButton = page.getByRole('button', { name: /add clause/i }).first();
    this.searchInput = page.getByPlaceholder('Search clauses...');
    this.clauseTableRows = page.locator('table tbody tr');
    this.clauseNumberInput = page.getByPlaceholder('e.g., 5.1');
    this.topicInput = page.getByPlaceholder('e.g., Liability');
    this.ourTemplateTextarea = page.getByPlaceholder('Paste our original contract/template language here');
    this.theirMarkupTextarea = page.getByPlaceholder("Paste counterparty's proposed changes or markup");
    this.ourResponseTextarea = page.getByPlaceholder('Enter our proposed response or counter-language');
    this.issueSummaryTextarea = page.getByPlaceholder("Brief summary of what's being negotiated...");
    this.ourRationaleTextarea = page.getByPlaceholder("Why we're taking this position...");
    this.cancelClauseButton = page.getByRole('button', { name: 'Cancel' });
  }

  async openAddClauseForm() {
    await this.addClauseButton.click();
    await this.page.waitForSelector('text=Add New Clause', { timeout: 3000 });
  }

  async addClause(data: ClauseData) {
    await this.openAddClauseForm();

    if (data.clauseNumber) await this.clauseNumberInput.fill(data.clauseNumber);
    if (data.topic) await this.topicInput.fill(data.topic);
    if (data.ourTemplate) await this.ourTemplateTextarea.fill(data.ourTemplate);
    if (data.theirMarkup) await this.theirMarkupTextarea.fill(data.theirMarkup);
    if (data.ourResponse) await this.ourResponseTextarea.fill(data.ourResponse);
    if (data.issueSummary) await this.issueSummaryTextarea.fill(data.issueSummary);
    if (data.ourRationale) await this.ourRationaleTextarea.fill(data.ourRationale);

    // Scroll down to make sure the save button is visible, then click it
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(300);

    // Click the submit button inside the form — last "Add Clause" button on page
    const submitBtn = this.page.getByRole('button', { name: 'Add Clause' }).last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Wait for the new row to appear in the table instead of waiting for form to hide
    await this.page.waitForTimeout(800);
  }

  async getClauseCount(): Promise<number> {
    return await this.clauseTableRows.count();
  }

  async searchClauses(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(400);
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  async deleteClause(rowIndex = 0) {
    const row = this.clauseTableRows.nth(rowIndex);
    await row.hover();
    const deleteBtn = row.getByRole('button', { name: /delete/i });
    await deleteBtn.click();
    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes|delete/i }).last();
    if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtn.click();
    }
    await this.page.waitForTimeout(400);
  }
}